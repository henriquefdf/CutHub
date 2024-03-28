import { setHours, setMinutes, format, addMinutes, isAfter } from 'date-fns';

export function generateDayTimeList(date: Date): string[] {
    const startTime = setMinutes(setHours(date, 9), 0); // Define o horário de início para 09:00
    const endTime = setMinutes(setHours(date, 21), 0); // Define o horário de término para 21:00
    const interval = 45; // Intervalo em minutos
    const timeList: string[] = [];
  
    let currentTime = startTime;
    const now = new Date(); // Obtém a data e hora atual

    while (currentTime <= endTime) {
        // Verifica se o horário atual na lista ainda não passou
        if (isAfter(currentTime, now)) {
            timeList.push(format(currentTime, "HH:mm"));
        }
        currentTime = addMinutes(currentTime, interval);
    }

    return timeList;
}
