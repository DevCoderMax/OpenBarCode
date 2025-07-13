import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotification, Notification } from '../../hooks/useNotification';
import { useThemeColor } from '@/hooks/useThemeColor';

interface NotificationContainerProps {
  notifications: Notification[];
}

export function NotificationContainer({ notifications }: NotificationContainerProps) {
  const { hideNotification } = useNotification();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  if (notifications.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => hideNotification(notification.id)}
          textColor={textColor}
        />
      ))}
    </View>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
  textColor: string;
}

function NotificationItem({ notification, onClose, textColor }: NotificationItemProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    // Fade out animation before closing
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#10b981', iconName: 'check-circle' as const };
      case 'error':
        return { backgroundColor: '#ef4444', iconName: 'error' as const };
      case 'warning':
        return { backgroundColor: '#f59e0b', iconName: 'warning' as const };
      default:
        return { backgroundColor: '#3b82f6', iconName: 'info' as const };
    }
  };

  const style = getNotificationStyle(notification.type);

  return (
    <Animated.View 
      style={[
        styles.notification, 
        { 
          backgroundColor: style.backgroundColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.content}>
        <MaterialIcons 
          name={style.iconName} 
          size={20} 
          color="white" 
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          {notification.message && (
            <Text style={styles.message}>{notification.message}</Text>
          )}
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 1,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  notification: {
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  icon: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});