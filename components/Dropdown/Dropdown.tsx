import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';

export interface DropdownItem {
  id: string;
  label: string;
  onPress?: () => void;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  style?: any;
  position?: 'left' | 'right';
  triggerStyle?: any;
  labelStyle?: any;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  items,
  style,
  position = 'left',
  triggerStyle,
  labelStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={[styles.trigger, triggerStyle]}>
        <Text style={[styles.triggerText, labelStyle]}>{label}</Text>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>▼</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.menuContainer}>
            <View style={styles.menu}>
              {items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => {
                    item.onPress?.();
                    setIsOpen(false);
                  }}>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 200,
  },
  triggerText: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  arrowContainer: {
    marginLeft: 8,
    width: 20,
    alignItems: 'center',
  },
  arrow: {
    fontSize: 12,
    color: '#6c757d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  menu: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 6,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1a202c',
  },
});
