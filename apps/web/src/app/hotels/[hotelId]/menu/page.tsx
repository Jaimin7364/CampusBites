import { PublicMenu } from '@/features/menu/public-menu';

export default async function HotelMenuPage({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = await params;
  return <PublicMenu hotelId={hotelId} />;
}
