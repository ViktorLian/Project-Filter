-- ===============================
-- FLOWPILOT CORE
-- ===============================

CREATE TABLE cashflow_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('IN', 'OUT')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT,
  occurred_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cashflow_metrics (
  company_id UUID PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  monthly_burn INTEGER NOT NULL DEFAULT 0,
  monthly_runway INTEGER NOT NULL DEFAULT 0,
  health_status TEXT NOT NULL CHECK (health_status IN ('GREEN','YELLOW','RED')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================
-- INVOICE SYSTEM
-- ===============================

CREATE TABLE invoice_customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES invoice_customers(id),
  invoice_number SERIAL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT','SENT','PAID','OVERDUE')),
  amount INTEGER NOT NULL,
  due_date DATE NOT NULL,
  issued_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================
-- INDEXES
-- ===============================

CREATE INDEX idx_cashflow_company ON cashflow_transactions(company_id);
CREATE INDEX idx_cashflow_date ON cashflow_transactions(occurred_at);
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoice_customers_company ON invoice_customers(company_id);

-- ===============================
-- RLS
-- ===============================

ALTER TABLE cashflow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cashflow company access"
ON cashflow_transactions
FOR ALL
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "metrics company access"
ON cashflow_metrics
FOR ALL
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "invoice company access"
ON invoices
FOR ALL
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "invoice customers access"
ON invoice_customers
FOR ALL
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
