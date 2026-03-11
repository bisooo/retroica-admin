export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-muted-foreground">
          Manage your product inventory.
        </p>
      </div>

      <div className="border-2 border-border p-8 text-center text-muted-foreground">
        No products yet.
      </div>
    </div>
  )
}
