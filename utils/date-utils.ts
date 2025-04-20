export const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };
  
  export const formatTimeFromSeconds = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  export const getDayName = (date: Date): string => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };
  
  export const getMonthName = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "long" });
  };
  
  export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  export const getWeekDays = (): string[] => {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  };
  
  export const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  
  export const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  };
  
  export const getTodayISOString = (): string => {
    return new Date().toISOString().split("T")[0];
  };