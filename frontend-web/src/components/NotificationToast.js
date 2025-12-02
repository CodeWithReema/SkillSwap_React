import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationToast = () => {
  const { notifications } = useNotifications();

  return (
    <div className="fixed top-24 right-6 z-50 space-y-3">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, type: 'spring' }}
            className="glass-card min-w-[320px] max-w-md shadow-glass-xl"
          >
            <div>
              <div className="font-bold text-glass-text-primary mb-2 text-lg">{notification.title}</div>
              <div className="text-sm text-glass-text-secondary">{notification.message}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
