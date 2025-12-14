import { cn } from '@/lib/utils';

export function Table({ children, className, ...props }) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          'w-full text-sm text-left text-gray-700 dark:text-gray-300',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }) {
  return (
    <thead
      className={cn(
        'text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }) {
  return (
    <tbody className={cn('divide-y divide-gray-200 dark:divide-gray-700', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }) {
  return (
    <tr
      className={cn(
        'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className, ...props }) {
  return (
    <th
      className={cn(
        'px-6 py-3 font-medium',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }) {
  return (
    <td
      className={cn(
        'px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}