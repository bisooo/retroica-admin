export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Retroica admin dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border-2 border-border p-4">
          <p className="text-sm text-muted-foreground">Total Products</p>
          <p className="text-3xl font-bold">_</p>
        </div>
        <div className="border-2 border-border p-4">
          <p className="text-sm text-muted-foreground">Total Customers</p>
          <p className="text-3xl font-bold">_</p>
        </div>
        <div className="border-2 border-border p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-3xl font-bold">_</p>
        </div>
        <div className="border-2 border-border p-4">
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-3xl font-bold">_</p>
        </div>
      </div>
    </div>
  )
}
