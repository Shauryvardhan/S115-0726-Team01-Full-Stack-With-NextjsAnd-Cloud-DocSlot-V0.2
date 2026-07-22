const styles: Record<string, string> = {
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function Badge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}