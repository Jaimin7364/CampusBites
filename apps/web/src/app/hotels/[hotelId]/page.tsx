import { VendorDetail } from '@/features/hotels/vendor-detail';

export default async function HotelDetailPage({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = await params;
  return <VendorDetail hotelId={hotelId} />;
}
