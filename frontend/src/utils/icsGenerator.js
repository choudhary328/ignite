export const generateICS = (event) => {
    const { title, description, date, time, location } = event;

    // Format date and time for ICS (YYYYMMDDTHHMMSSZ)
    // Assuming date is in YYYY-MM-DD format and time is in HH:mm format
    const eventDate = new Date(date);
    const [hours, minutes] = time.split(':');
    eventDate.setHours(parseInt(hours), parseInt(minutes));

    const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startDate = formatICSDate(eventDate);
    const endDate = formatICSDate(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000)); // Default 2 hours duration

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Ignite//Event Export//EN',
        'BEGIN:VEVENT',
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
        `LOCATION:${location}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_Ignite.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
