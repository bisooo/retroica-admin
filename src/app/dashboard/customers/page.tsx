export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground">
          View and manage your customer base.
        </p>
      </div>

      <div className="border-2 border-border p-8 text-center text-muted-foreground">
        No customers yet.
      </div>
    </div>
  )
}
