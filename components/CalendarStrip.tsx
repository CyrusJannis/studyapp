import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { getDayName, getDatesBetween } from "@/utils/date-utils";
import { useTaskStore } from "@/store/task-store";

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [dates, setDates] = useState<Date[]>([]);
  const { tasks } = useTaskStore();
  
  const windowWidth = Dimensions.get("window").width;
  const dayWidth = 60;
  const visibleDays = Math.floor(windowWidth / dayWidth);
  
  useEffect(() => {
    // Generate dates for the calendar strip (2 weeks before and after today)
    const today = new Date();
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(today.getDate() + 14);
    
    const dateRange = getDatesBetween(twoWeeksAgo, twoWeeksFromNow);
    setDates(dateRange);
    
    // Scroll to selected date
    setTimeout(() => {
      scrollToSelectedDate();
    }, 100);
  }, []);
  
  const scrollToSelectedDate = () => {
    if (!scrollViewRef.current) return;
    
    const selectedIndex = dates.findIndex(
      (date) => date.toDateString() === selectedDate.toDateString()
    );
    
    if (selectedIndex !== -1) {
      const scrollX = selectedIndex * dayWidth - (windowWidth - dayWidth) / 2;
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
    }
  };
  
  useEffect(() => {
    scrollToSelectedDate();
  }, [selectedDate]);
  
  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
  };
  
  const scrollLeft = () => {
    if (!scrollViewRef.current) return;
    
    const selectedIndex = dates.findIndex(
      (date) => date.toDateString() === selectedDate.toDateString()
    );
    
    if (selectedIndex > 0) {
      const newDate = dates[selectedIndex - 1];
      onDateSelect(newDate);
    }
  };
  
  const scrollRight = () => {
    if (!scrollViewRef.current) return;
    
    const selectedIndex = dates.findIndex(
      (date) => date.toDateString() === selectedDate.toDateString()
    );
    
    if (selectedIndex < dates.length - 1) {
      const newDate = dates[selectedIndex + 1];
      onDateSelect(newDate);
    }
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const hasTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return tasks.some((task) => task.date === dateString);
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.arrowButton} onPress={scrollLeft}>
        <ChevronLeft size={24} color={colors.text} />
      </TouchableOpacity>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((date, index) => {
          const _isToday = isToday(date);
          const _isSelected = isSelected(date);
          const _hasTasks = hasTasksForDate(date);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                _isSelected && styles.selectedDayContainer,
              ]}
              onPress={() => handleDateSelect(date)}
            >
              <Text
                style={[
                  styles.dayName,
                  _isSelected && styles.selectedDayText,
                  _isToday && styles.todayText,
                ]}
              >
                {getDayName(date)}
              </Text>
              <View
                style={[
                  styles.dateCircle,
                  _isSelected && styles.selectedDateCircle,
                  _isToday && styles.todayCircle,
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    _isSelected && styles.selectedDateText,
                    _isToday && !_isSelected && styles.todayDateText,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
              {_hasTasks && <View style={styles.taskDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <TouchableOpacity style={styles.arrowButton} onPress={scrollRight}>
        <ChevronRight size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 90,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  dayContainer: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  selectedDayContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },
  dayName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  selectedDateCircle: {
    backgroundColor: colors.primary,
  },
  todayCircle: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  selectedDateText: {
    color: "#fff",
    fontWeight: "bold",
  },
  selectedDayText: {
    color: colors.primary,
    fontWeight: "600",
  },
  todayText: {
    color: colors.primary,
    fontWeight: "600",
  },
  todayDateText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    position: "absolute",
    bottom: 6,
  },
  arrowButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});