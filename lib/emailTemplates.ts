export const EMAIL_TEMPLATES = {
  template_1: {
    name: 'Standard Thank You',
    subject: 'Takk for din henvendelse',
    body: `Hei {{customer_name}},

Tusen takk for at du tok deg tid til å fylle ut skjemaet! 

Vi har mottatt informasjonen din og skal se nærmere på det. Vi kontakter deg snart med tilbakemelding.

Mvh,
{{business_name}}`
  },
  template_2: {
    name: 'Quick Response',
    subject: 'Vi er interessert!',
    body: `Hei {{customer_name}},

Takk for henvendelsen! Vi synes dette ser veldig interessant ut.

Vi skal komme tilbake til deg innen 24 timer med konkrete forslag.

Hilsen,
{{business_name}}`
  },
  template_3: {
    name: 'Professional Follow-up',
    subject: 'Din forespørsel er registrert',
    body: `Hei {{customer_name}},

Vi har registrert din forespørsel og tatt det opp med vårt team.

Du vil høre fra oss så snart som mulig. Vi setter pris på din interesse!

Vennlig hilsen,
{{business_name}}`
  },
  template_4: {
    name: 'Casual Friendly',
    subject: 'Hey {{customer_name}} 👋',
    body: `Hei {{customer_name}},

Takk for at du tok kontakt! Vi liker det du spurte om.

Skal ta en titt på det og kommer tilbake til deg raskt. 

Snakkes!
{{business_name}}`
  },
  template_5: {
    name: 'Detailed Info Request',
    subject: 'Trenger vi mer informasjon?',
    body: `Hei {{customer_name}},

Takk for henvendelsen din. Vi har fått informasjonen og gjennomgår den nå.

Hvis vi trenger mer detaljer, kontakter vi deg på {{customer_phone}}.

Ellers venter vi tilbakemelding snart.

Best regards,
{{business_name}}`
  }
};
