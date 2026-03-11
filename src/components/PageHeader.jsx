function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 rounded-xl bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1F4E79] sm:text-2xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}

export default PageHeader;
