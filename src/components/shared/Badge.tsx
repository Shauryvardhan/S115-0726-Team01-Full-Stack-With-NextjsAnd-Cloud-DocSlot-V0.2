const styles: Record<string, { bg: string; text: string; dot: string }> = {
  CONFIRMED: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  COMPLETED: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
};

export default function Badge({ status }: { status: string }) {
  const style = styles[status] ?? { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}