import { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button } from "@material-tailwind/react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export function AppointmentModal({ open, handleClose, existingAppointments }) {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        // Transform existing appointments to FullCalendar events format
        const formattedEvents = existingAppointments.map(appointment => ({
            id: appointment._id,
            title: 'Reserved',
            start: new Date(`${appointment.date}T${appointment.time}`),
            end: new Date(`${appointment.date}T${add30Minutes(appointment.time)}`),
            backgroundColor: '#f87171', // Red color for blocked slots
            borderColor: '#f87171',
            display: 'background',
            editable: false
        }));
        setEvents(formattedEvents);
    }, [existingAppointments]);

    function add30Minutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes + 30, 0, 0);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    const handleDateSelect = (selectInfo) => {
        // Check if selected slot is available
        const calendarApi = selectInfo.view.calendar;
        calendarApi.unselect(); // Clear date selection

        const isSlotAvailable = !events.some(event =>
            selectInfo.start >= event.start &&
            selectInfo.end <= event.end
        );

        if (!isSlotAvailable) {
            alert('This time slot is already booked!');
            return;
        }

        // Proceed with booking if slot is available
        const title = 'New Appointment';
        calendarApi.addEvent({
            id: createEventId(),
            title,
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: selectInfo.allDay
        });
    };

    function createEventId() {
        return String(Date.now());
    }

    return (
        <Dialog
            open={open}
            handler={handleClose}
            size="xxl"
            className="h-[90vh] w-[95vw] max-w-none"
        >
            <DialogHeader>Book Appointment</DialogHeader>
            <DialogBody className="h-full p-0">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    initialView="timeGridWeek"
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    nowIndicator={true}
                    initialEvents={events}
                    select={handleDateSelect}
                    eventContent={renderEventContent}
                    height="100%"
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    businessHours={{
                        daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                        startTime: '08:00',
                        endTime: '20:00',
                    }}
                />
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={handleClose} className="mr-1">
                    Cancel
                </Button>
                <Button variant="gradient" color="green" onClick={handleClose}>
                    Confirm Appointment
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

function renderEventContent(eventInfo) {
    return (
        <>
            <b>{eventInfo.timeText}</b>
            <i>{eventInfo.event.title}</i>
        </>
    );
}