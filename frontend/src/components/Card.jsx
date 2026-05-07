export default function Card({ title, subtitle, children, action, className = "" }) {
  return (
    <div className={`bg-white border border-ios-gray-200/70 rounded-2xl shadow-apple hover:shadow-apple-lg transition-all duration-300 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-ios-gray-200/50">
          <div>
            {title && <h3 className="font-semibold text-ios-gray-700 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-ios-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}