import { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';

export default function Calendar() {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent } = useUserData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    needsBased: false
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title.trim() && newEvent.date && newEvent.time) {
      const eventDate = new Date(`${newEvent.date}T${newEvent.time}`);
      addCalendarEvent({
        title: newEvent.title,
        date: eventDate,
        sharedWith: [],
        needsBased: newEvent.needsBased
      });
      setNewEvent({ title: '', date: '', time: '', needsBased: false });
      setShowAddForm(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteCalendarEvent(id);
    }
  };

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
    return calendarEvents.filter(event => {
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-zinc-100 mb-2">Calendar</h1>
          <p className="text-zinc-400">
            Plan and coordinate with your trusted connections
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <div className="mb-6 border border-zinc-800 p-6 bg-zinc-950">
          <h2 className="text-lg font-medium text-zinc-100 mb-4">New Event</h2>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:outline-none"
                placeholder="Event title"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="needsBased"
                checked={newEvent.needsBased}
                onChange={(e) => setNewEvent({ ...newEvent, needsBased: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="needsBased" className="text-sm text-zinc-400">
                Needs-based event
              </label>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            >
              Add Event
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <div className="border border-zinc-800 bg-zinc-950 p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="px-4 py-2 border border-zinc-800 hover:border-zinc-600 text-zinc-300 transition-colors"
              >
                Previous
              </button>
              <h2 className="text-xl font-medium text-zinc-100">
                {monthName}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="px-4 py-2 border border-zinc-800 hover:border-zinc-600 text-zinc-300 transition-colors"
              >
                Next
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-zinc-400 py-2">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square border border-zinc-800" />
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
                        ? 'border-zinc-100 bg-zinc-900' 
                        : 'border-zinc-800'
                    }`}
                  >
                    <div className={`text-sm mb-1 ${
                      isToday ? 'font-medium text-zinc-100' : 'text-zinc-400'
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
                                ? 'bg-blue-900 text-blue-200' 
                                : 'bg-zinc-700 text-zinc-200'
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
          <div className="border border-zinc-800 bg-zinc-950 p-6 sticky top-4">
            <h2 className="text-lg font-medium text-zinc-100 mb-4">
              Upcoming Events
            </h2>
            <div className="space-y-4">
              {events
                .filter(e => new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="border-l-2 border-zinc-100 pl-3">
                    <div className="font-medium text-zinc-100">{event.title}</div>
                    <div className="text-sm text-zinc-400 mt-1">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Shared with {event.sharedWith.length} {event.sharedWith.length === 1 ? 'person' : 'people'}
                    </div>
                    {event.needsBased && (
                      <div className="text-xs text-blue-400 mt-1">
                        Needs-based event
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-xs mt-2 px-2 py-1 bg-red-900 text-red-200 hover:bg-red-800 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
