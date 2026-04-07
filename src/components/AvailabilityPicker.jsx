import { useMemo } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = ['AM', 'PM'];

function AvailabilityPicker({ value = [], onChange }) {
  const active = useMemo(() => new Set(value), [value]);

  const toggleSlot = (day, slot) => {
    const key = `${day}-${slot}`;
    const next = new Set(active);

    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }

    onChange?.(Array.from(next));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Availability Schedule</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {DAYS.map((day) => (
          <div key={day} className="rounded-lg border border-gray-200 p-2">
            <p className="mb-2 text-xs font-semibold text-gray-600">{day}</p>
            <div className="space-y-2">
              {SLOTS.map((slot) => {
                const key = `${day}-${slot}`;
                const isActive = active.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSlot(day, slot)}
                    className={`cursor-pointer w-full rounded-md px-2 py-1 text-xs font-medium ${
                      isActive ? 'bg-[#1F4E79] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AvailabilityPicker;
