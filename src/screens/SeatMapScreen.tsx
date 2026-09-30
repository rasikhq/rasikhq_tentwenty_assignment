import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '../components/BackButton';
import { Button } from '../components/Button';
import { HallView } from '../components/HallView';
import { Screen } from '../components/Screen';
import { SeatChip } from '../components/SeatChip';
import { SeatLegend } from '../components/SeatLegend';
import { SelectionSummary } from '../components/SelectionSummary';
import { Text } from '../components/Text';
import { Toast } from '../components/Toast';
import { HALLS } from '../data/halls';
import { MAX_SELECTION, useSelection } from '../hooks/useSelection';
import { formatDate } from '../lib/dates';
import { layOutHall, SEAT_TYPES, seatsOf } from '../lib/hall';
import { WIDE_BREAKPOINT } from '../lib/layout';
import { unavailableSeatIds } from '../lib/unavailableSeats';
import type { RootStackParamList } from '../navigation/RootNavigator';

// The space between the hall and the sides of the window
const HALL_MARGIN = 16;
// The space between the bottom bar's content and the sides of the window
const BAR_PADDING = 20;

export function SeatMapScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'SeatMap'>) {
  const { title, showtime } = route.params;
  const hall = HALLS[showtime.hallId];
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const selection = useSelection();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // The layout belongs to the hall and the unavailable seats to the showtime. Neither changes while
  // the screen is open, so the seats keep their identity and only a changed seat renders again.
  const rows = useMemo(() => layOutHall(hall), [hall]);
  const unavailableIds = useMemo(() => unavailableSeatIds(showtime, seatsOf(rows)), [showtime, rows]);
  const selectedIds = useMemo(() => new Set(selection.seats.map((seat) => seat.id)), [selection.seats]);
  const total = selection.seats.reduce((sum, seat) => sum + SEAT_TYPES[seat.seatType].price, 0);
  // A wide window has room beside things, and a phone on its side has no height to spare: either way
  // the legend takes one row, and the chips, total and button share one
  const isCompact = window.width >= WIDE_BREAKPOINT || window.width > window.height;

  const chips = (
    // A fixed height, so the first chip doesn't push the rest of the screen around
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel="Selected seats"
      className="h-8 grow-0"
      contentContainerStyle={{ gap: 8, alignItems: 'center' }}
    >
      {selection.seats.length === 0 && <Text variant="legend">No seats selected</Text>}
      {selection.seats.map((seat) => (
        <SeatChip key={seat.id} seat={seat} onRemove={() => selection.remove(seat)} />
      ))}
    </ScrollView>
  );
  const totalPrice = (
    <View className="h-12 justify-center rounded-xl bg-light-grey px-4">
      <Text variant="totalLabel">Total Price</Text>
      <Text variant="total">{`$${total}`}</Text>
    </View>
  );
  const proceed = (
    <Button
      label="Proceed to pay"
      disabled={selection.seats.length === 0}
      onPress={() => setIsSummaryOpen(true)}
    />
  );

  return (
    <Screen
      header={
        <>
          <BackButton onPress={navigation.goBack} />
          <View className="flex-1 items-center px-2">
            <Text variant="title" accessibilityRole="header" numberOfLines={1}>
              {title}
            </Text>
            <Text variant="headerDetail" numberOfLines={1}>
              {`${formatDate(showtime.date)} | ${showtime.time} ${hall.name}`}
            </Text>
          </View>
          {/* As wide as the back button shows, so the title sits in the middle of the bar */}
          <View className="w-[36px]" />
        </>
      }
    >
      {/* Movie detail, under this screen, may have turned the status bar's icons light for its image */}
      <StatusBar style="dark" />
      {/* The hall takes the height the rest leaves. A hall taller than that scrolls inside it, so the page never does. */}
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}
        >
          <HallView
            rows={rows}
            width={window.width - insets.left - insets.right - 2 * HALL_MARGIN}
            unavailableIds={unavailableIds}
            selectedIds={selectedIds}
            onToggleSeat={selection.toggle}
          />
        </ScrollView>
        {/* Over the bottom of the hall. A new key for each refusal starts the toast again. */}
        {selection.refusals > 0 && (
          <Toast key={selection.refusals} message={`You can pick up to ${MAX_SELECTION} seats`} />
        )}
      </View>
      <SeatLegend compact={isCompact} />
      {/* The bar's white runs to the window's edges, under a display cutout or the home indicator, and its content clears them */}
      <View
        className="bg-white pt-3"
        style={{
          marginLeft: -insets.left,
          marginRight: -insets.right,
          paddingLeft: BAR_PADDING + insets.left,
          paddingRight: BAR_PADDING + insets.right,
          paddingBottom: 12 + insets.bottom,
        }}
      >
        {isCompact ? (
          <View className="flex-row items-center gap-3">
            <View className="flex-1">{chips}</View>
            {totalPrice}
            {proceed}
          </View>
        ) : (
          <View className="gap-3">
            {chips}
            <View className="flex-row items-center gap-3">
              {totalPrice}
              <View className="flex-1">{proceed}</View>
            </View>
          </View>
        )}
      </View>
      {isSummaryOpen && (
        <SelectionSummary seats={selection.seats} total={total} onClose={() => setIsSummaryOpen(false)} />
      )}
    </Screen>
  );
}
