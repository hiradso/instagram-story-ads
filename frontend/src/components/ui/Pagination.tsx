import { Button } from './Button'

export function Pagination({
  currentPage,
  lastPage,
  total,
  onPageChange,
}: {
  currentPage: number
  lastPage: number
  total: number
  onPageChange: (page: number) => void
}) {
  if (lastPage <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        قبلی
      </Button>
      <span className="text-faint">
        صفحه {currentPage.toLocaleString('fa-IR')} از {lastPage.toLocaleString('fa-IR')} · {total.toLocaleString('fa-IR')} مورد
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        بعدی
      </Button>
    </div>
  )
}
