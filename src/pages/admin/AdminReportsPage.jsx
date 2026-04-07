import PageHeader from '../../components/PageHeader.jsx';

function AdminReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Prepare downloadable labor market and placement reports for stakeholders."
      />

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">
          Select a report type below to generate and download labor market insights.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
          <li>Monthly demand by skill category</li>
          <li>Applicant credential verification summary</li>
          <li>Placement outcomes by municipality</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminReportsPage;
