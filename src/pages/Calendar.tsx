import { useState } from 'react';
import type { CalendarEvent } from '../types';

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Coffee with Sarah',
    date: new Date('2024-01-20T10:00:00'),
    sharedWith: ['1']
  },
  {
    id: '2',
    title: 'Career Planning Session',
    date: new Date('2024-01-22T14:00:00'),
    sharedWith: ['2'],
    needsBased: true
  },
  {
    id: '3',
    title: 'Project Review',
    date: new Date('2024-01-25T16:00:00'),
    sharedWith: ['2', '3']
  }
];

export default function Calendar() {
  const [events] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Simple month view
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);
  
  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === selectedDate.getMonth() &&
             eventDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-stone-900 mb-2">Calendar</h1>
        <p className="text-stone-600">
          Plan and coordinate with your trusted connections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <div className="border border-stone-200 bg-white p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="px-4 py-2 border border-stone-300 hover:border-stone-400 text-stone-700 transition-colors"
              >
                Previous
              </button>
              <h2 className="text-xl font-medium text-stone-900">
                {monthName}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="px-4 py-2 border border-stone-300 hover:border-stone-400 text-stone-700 transition-colors"
              >
                Next
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-stone-600 py-2">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square border border-stone-100" />
              ))}
              
              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = 
                  day === new Date().getDate() &&
                  selectedDate.getMonth() === new Date().getMonth() &&
                  selectedDate.getFullYear() === new Date().getFullYear();
                
                return (
                  <div
                    key={day}
                    className={`aspect-square border p-2 ${
                      isToday 
                        ? 'border-stone-900 bg-stone-50' 
                        : 'border-stone-200'
                    }`}
                  >
                    <div className={`text-sm mb-1 ${
                      isToday ? 'font-medium text-stone-900' : 'text-stone-700'
                    }`}>
                      {day}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="space-y-1">
                        {dayEvents.map(event => (
                          <div
                            key={event.id}
                            className={`text-xs px-1 py-0.5 truncate ${
                              event.needsBased 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-stone-200 text-stone-800'
                            }`}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event List */}
        <div className="lg:col-span-1">
          <div className="border border-stone-200 bg-white p-6 sticky top-4">
            <h2 className="text-lg font-medium text-stone-900 mb-4">
              Upcoming Events
            </h2>
            <div className="space-y-4">
              {events
                .filter(e => new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="border-l-2 border-stone-900 pl-3">
                    <div className="font-medium text-stone-900">{event.title}</div>
                    <div className="text-sm text-stone-600 mt-1">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      Shared with {event.sharedWith.length} {event.sharedWith.length === 1 ? 'person' : 'people'}
                    </div>
                    {event.needsBased && (
                      <div className="text-xs text-blue-600 mt-1">
                        Needs-based event
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
