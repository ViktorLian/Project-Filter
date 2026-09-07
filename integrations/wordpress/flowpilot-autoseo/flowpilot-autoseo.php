<?php
/**
 * Plugin Name: FlowPilot AutoSEO
 * Description: Mottar signerte AutoSEO-artikler fra FlowPilot og oppretter WordPress-innlegg.
 * Version: 1.0.0
 * Author: FlowPilot
 */

if (!defined('ABSPATH')) {
    exit;
}

final class FlowPilot_AutoSEO {
    private const OPTION_KEY = 'flowpilot_autoseo_settings';
    private const REST_NAMESPACE = 'flowpilot/v1';
    private const REST_ROUTE = '/publish';

    public static function init(): void {
        add_action('rest_api_init', [self::class, 'register_route']);
        add_action('admin_menu', [self::class, 'register_settings_page']);
        add_action('admin_init', [self::class, 'register_settings']);
    }

    public static function activate(): void {
        $settings = get_option(self::OPTION_KEY, []);
        if (empty($settings['secret'])) {
            $settings['secret'] = wp_generate_password(48, false, false);
        }
        $settings['post_status'] = $settings['post_status'] ?? 'draft';
        $settings['category_id'] = isset($settings['category_id']) ? absint($settings['category_id']) : 0;
        update_option(self::OPTION_KEY, $settings, false);
    }

    public static function register_route(): void {
        register_rest_route(self::REST_NAMESPACE, self::REST_ROUTE, [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [self::class, 'receive_article'],
            'permission_callback' => '__return_true',
        ]);
    }

    public static function receive_article(WP_REST_Request $request): WP_REST_Response|WP_Error {
        $raw_body = $request->get_body();
        $signature = (string) $request->get_header('x-flowpilot-signature');
        $settings = get_option(self::OPTION_KEY, []);
        $secret = isset($settings['secret']) ? (string) $settings['secret'] : '';

        if ($secret === '' || !str_starts_with($signature, 'sha256=')) {
            return new WP_Error('flowpilot_unauthorized', 'Mangler gyldig FlowPilot-signatur.', ['status' => 401]);
        }

        $expected = 'sha256=' . hash_hmac('sha256', $raw_body, $secret);
        if (!hash_equals($expected, $signature)) {
            return new WP_Error('flowpilot_unauthorized', 'Ugyldig FlowPilot-signatur.', ['status' => 401]);
        }

        $payload = json_decode($raw_body, true);
        if (!is_array($payload) || ($payload['event'] ?? '') !== 'flowpilot.seo.publish') {
            return new WP_Error('flowpilot_bad_event', 'Ugyldig FlowPilot-hendelse.', ['status' => 400]);
        }

        $article = isset($payload['article']) && is_array($payload['article']) ? $payload['article'] : [];
        $title = sanitize_text_field($article['title'] ?? '');
        $slug = sanitize_title($article['slug'] ?? $title);
        $markdown = isset($article['contentMarkdown']) ? (string) $article['contentMarkdown'] : '';

        if ($title === '' || $slug === '' || $markdown === '') {
            return new WP_Error('flowpilot_missing_content', 'Tittel, slug eller innhold mangler.', ['status' => 422]);
        }

        $existing = get_page_by_path($slug, OBJECT, 'post');
        if ($existing instanceof WP_Post) {
            return new WP_REST_Response([
                'ok' => true,
                'duplicate' => true,
                'postId' => $existing->ID,
                'status' => $existing->post_status,
                'url' => get_permalink($existing),
            ], 200);
        }

        $status = ($settings['post_status'] ?? 'draft') === 'publish' ? 'publish' : 'draft';
        $post = [
            'post_title' => $title,
            'post_name' => $slug,
            'post_excerpt' => sanitize_textarea_field($article['excerpt'] ?? ''),
            'post_content' => self::markdown_to_html($markdown),
            'post_status' => $status,
            'post_type' => 'post',
        ];

        $category_id = isset($settings['category_id']) ? absint($settings['category_id']) : 0;
        if ($category_id > 0) {
            $post['post_category'] = [$category_id];
        }

        $post_id = wp_insert_post(wp_slash($post), true);
        if (is_wp_error($post_id)) {
            return new WP_Error('flowpilot_insert_failed', $post_id->get_error_message(), ['status' => 500]);
        }

        $meta_description = sanitize_text_field($article['metaDescription'] ?? '');
        if ($meta_description !== '') {
            update_post_meta($post_id, '_flowpilot_meta_description', $meta_description);
            update_post_meta($post_id, '_yoast_wpseo_metadesc', $meta_description);
            update_post_meta($post_id, 'rank_math_description', $meta_description);
        }
        update_post_meta($post_id, '_flowpilot_generated_at', sanitize_text_field($payload['generatedAt'] ?? ''));

        return new WP_REST_Response([
            'ok' => true,
            'duplicate' => false,
            'postId' => $post_id,
            'status' => $status,
            'url' => get_permalink($post_id),
        ], 201);
    }

    private static function markdown_to_html(string $markdown): string {
        $lines = preg_split('/\R/', trim($markdown));
        $html = [];
        $paragraph = [];
        $in_list = false;

        $flush_paragraph = static function () use (&$paragraph, &$html): void {
            if ($paragraph) {
                $html[] = '<p>' . implode('<br>', array_map('esc_html', $paragraph)) . '</p>';
                $paragraph = [];
            }
        };

        foreach ($lines ?: [] as $line) {
            $trimmed = trim($line);
            if ($trimmed === '') {
                $flush_paragraph();
                if ($in_list) {
                    $html[] = '</ul>';
                    $in_list = false;
                }
                continue;
            }
            if (preg_match('/^(#{1,4})\s+(.+)$/', $trimmed, $match)) {
                $flush_paragraph();
                if ($in_list) {
                    $html[] = '</ul>';
                    $in_list = false;
                }
                $level = strlen($match[1]);
                $html[] = sprintf('<h%d>%s</h%d>', $level, esc_html($match[2]), $level);
                continue;
            }
            if (preg_match('/^[-*]\s+(.+)$/', $trimmed, $match)) {
                $flush_paragraph();
                if (!$in_list) {
                    $html[] = '<ul>';
                    $in_list = true;
                }
                $html[] = '<li>' . esc_html($match[1]) . '</li>';
                continue;
            }
            $paragraph[] = $trimmed;
        }
        $flush_paragraph();
        if ($in_list) {
            $html[] = '</ul>';
        }

        $result = implode("\n", $html);
        $result = preg_replace('/\*\*(.+?)\*\*/s', '<strong>$1</strong>', $result);
        $result = preg_replace('/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/', '<a href="$2">$1</a>', $result);
        return wp_kses_post($result);
    }

    public static function register_settings_page(): void {
        add_options_page('FlowPilot AutoSEO', 'FlowPilot AutoSEO', 'manage_options', 'flowpilot-autoseo', [self::class, 'render_settings_page']);
    }

    public static function register_settings(): void {
        register_setting('flowpilot_autoseo', self::OPTION_KEY, [
            'type' => 'array',
            'sanitize_callback' => [self::class, 'sanitize_settings'],
        ]);
    }

    public static function sanitize_settings(array $input): array {
        return [
            'secret' => sanitize_text_field($input['secret'] ?? ''),
            'post_status' => ($input['post_status'] ?? 'draft') === 'publish' ? 'publish' : 'draft',
            'category_id' => absint($input['category_id'] ?? 0),
        ];
    }

    public static function render_settings_page(): void {
        if (!current_user_can('manage_options')) {
            return;
        }
        $settings = get_option(self::OPTION_KEY, []);
        $endpoint = rest_url(self::REST_NAMESPACE . self::REST_ROUTE);
        ?>
        <div class="wrap">
            <h1>FlowPilot AutoSEO</h1>
            <p>Kopiér webhook-adressen og hemmeligheten til FlowPilot → SEO og faginnhold.</p>
            <form method="post" action="options.php">
                <?php settings_fields('flowpilot_autoseo'); ?>
                <table class="form-table" role="presentation">
                    <tr><th scope="row">Webhook-adresse</th><td><input class="regular-text" type="text" readonly value="<?php echo esc_attr($endpoint); ?>"></td></tr>
                    <tr><th scope="row"><label for="flowpilot-secret">Webhook-hemmelighet</label></th><td><input class="regular-text" id="flowpilot-secret" name="<?php echo esc_attr(self::OPTION_KEY); ?>[secret]" type="text" value="<?php echo esc_attr($settings['secret'] ?? ''); ?>" autocomplete="off"></td></tr>
                    <tr><th scope="row"><label for="flowpilot-status">Ny artikkel opprettes som</label></th><td><select id="flowpilot-status" name="<?php echo esc_attr(self::OPTION_KEY); ?>[post_status]"><option value="draft" <?php selected($settings['post_status'] ?? 'draft', 'draft'); ?>>Utkast (anbefalt)</option><option value="publish" <?php selected($settings['post_status'] ?? 'draft', 'publish'); ?>>Publisert automatisk</option></select></td></tr>
                    <tr><th scope="row"><label for="flowpilot-category">Standardkategori</label></th><td><?php wp_dropdown_categories(['show_option_none' => 'Ingen valgt', 'option_none_value' => 0, 'hide_empty' => false, 'id' => 'flowpilot-category', 'name' => self::OPTION_KEY . '[category_id]', 'selected' => absint($settings['category_id'] ?? 0)]); ?></td></tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}

register_activation_hook(__FILE__, [FlowPilot_AutoSEO::class, 'activate']);
FlowPilot_AutoSEO::init();
