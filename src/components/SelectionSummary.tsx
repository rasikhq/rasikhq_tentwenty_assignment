import { Modal, ScrollView, View } from 'react-native';

import { SEAT_TYPES, type Seat } from '../lib/hall';
import { Button } from './Button';
import { Text } from './Text';

type SelectionSummaryProps = {
  seats: Seat[];
  /** The sum of the seats' prices, in dollars. */
  total: number;
  onClose: () => void;
};

/**
 * Where the booking flow ends: the selection and its total, over the seat map, saying that nothing is
 * paid or booked. Closing it, with its button or Android back, leaves the seat map as it was.
 */
export function SelectionSummary({ seats, total, onClose }: SelectionSummaryProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      // iOS shows a modal in portrait only unless it is told otherwise
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-navy/60 p-5">
        <View accessibilityViewIsModal className="max-h-full w-full max-w-[400px] gap-4 rounded-2xl bg-white p-5">
          <Text variant="stateTitle" accessibilityRole="header">
            Your selection
          </Text>
          {/* Eight seats don't fit a phone on its side, so the seats scroll and the rest stays in view */}
          <ScrollView className="shrink grow-0">
            {seats.map((seat) => {
              const { name, price } = SEAT_TYPES[seat.seatType];
              return (
                <View key={seat.id} className="flex-row justify-between py-1">
                  <Text variant="body">{`Row ${seat.row}, seat ${seat.number}`}</Text>
                  <Text variant="body">{`${name} $${price}`}</Text>
                </View>
              );
            })}
          </ScrollView>
          <Text variant="total">{`Total $${total}`}</Text>
          <Text variant="stateMessage">Payment isn&apos;t part of this demo, so nothing is booked.</Text>
          <Button label="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
