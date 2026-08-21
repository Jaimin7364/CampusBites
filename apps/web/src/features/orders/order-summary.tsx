import { formatInr } from '@/utils/money';

export function OrderPriceSummary({ totals }: { totals: { itemsTotalPaise: number; deliveryChargePaise: number; platformFeePaise: number; grandTotalPaise: number } }) {
  return <dl className="mt-5 space-y-3 text-sm">
    <div className="flex justify-between"><dt>Items</dt><dd>{formatInr(totals.itemsTotalPaise)}</dd></div>
    <div className="flex justify-between"><dt>Delivery charge</dt><dd>{formatInr(totals.deliveryChargePaise)}</dd></div>
    <div className="flex justify-between"><dt>Platform fee</dt><dd>{formatInr(totals.platformFeePaise)}</dd></div>
    <div className="flex justify-between border-t border-stone-200 pt-4 text-base font-bold"><dt>Grand total</dt><dd>{formatInr(totals.grandTotalPaise)}</dd></div>
  </dl>;
}
