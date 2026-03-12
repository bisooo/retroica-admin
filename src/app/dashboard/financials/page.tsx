export default function FinancialsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Financials</h1>
        <p className="text-muted-foreground">
          Track revenue, expenses, and financial reports.
        </p>
      </div>

      <div className="border-2 border-border p-8 text-center text-muted-foreground">
        No financial data yet.
      </div>
    </div>
  )
}
