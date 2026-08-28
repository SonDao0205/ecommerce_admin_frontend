"use client";

import { Boxes, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  ProductVariant,
  ProductVariantGroupInput,
} from "@/src/features/products";

type VariantChildDraft = ProductVariantGroupInput["children"][number] & {
  key: string;
};

interface VariantGroupDraft extends Omit<ProductVariantGroupInput, "children"> {
  key: string;
  children: VariantChildDraft[];
}

interface ProductVariantEditorProps {
  initialVariants?: ProductVariant[];
  disabled?: boolean;
  onChange: (variants: ProductVariantGroupInput[]) => void;
  skuErrors?: Record<string, string>;
}

function newChild(): VariantChildDraft {
  return {
    key: crypto.randomUUID(),
    name: "Dung lượng",
    value: "",
    sku: "",
    unitPrice: 0,
    stock: 0,
  };
}

export function ProductVariantEditor({
  initialVariants = [],
  disabled,
  onChange,
  skuErrors = {},
}: ProductVariantEditorProps) {
  const [groups, setGroups] = useState<VariantGroupDraft[]>(() =>
    initialVariants.map((group) => ({
      key: group.id ?? crypto.randomUUID(),
      id: group.id,
      name: group.name,
      value: group.value,
      children: (group.children ?? []).map((child) => ({
        key: child.id ?? crypto.randomUUID(),
        id: child.id,
        name: child.name,
        value: child.value,
        sku: child.sku ?? "",
        unitPrice: Number(child.unitPrice ?? 0),
        stock: child.stock ?? 0,
      })),
    })),
  );

  function commit(next: VariantGroupDraft[]) {
    setGroups(next);
    onChange(
      next.map(({ id, name, value, children }) => ({
        id,
        name,
        value,
        children: children.map(({ id: childId, name: childName, value: childValue, sku, unitPrice, stock }) => ({
          id: childId,
          name: childName,
          value: childValue,
          sku,
          unitPrice,
          stock,
        })),
      })),
    );
  }

  function addGroup() {
    commit([
      ...groups,
      {
        key: crypto.randomUUID(),
        name: "Màu sắc",
        value: "",
        children: [newChild()],
      },
    ]);
  }

  function updateGroup(index: number, patch: Partial<VariantGroupDraft>) {
    commit(groups.map((group, current) => (current === index ? { ...group, ...patch } : group)));
  }

  function updateChild(
    groupIndex: number,
    childIndex: number,
    patch: Partial<VariantChildDraft>,
  ) {
    const group = groups[groupIndex];
    updateGroup(groupIndex, {
      children: group.children.map((child, current) =>
        current === childIndex ? { ...child, ...patch } : child,
      ),
    });
  }

  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-semibold"><Boxes className="size-4 text-[#ff5a1f]" /> Biến thể sản phẩm</div>
          <p className="mt-1 text-xs text-muted-foreground">Nhóm cha như Màu sắc; biến thể con như Dung lượng có giá và tồn kho riêng.</p>
        </div>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={addGroup}>
          <Plus /> Thêm nhóm
        </Button>
      </div>

      {groups.length === 0 && (
        <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">Sản phẩm chưa có biến thể.</p>
      )}

      {groups.map((group, groupIndex) => (
        <section key={group.key} className="space-y-3 rounded-xl border bg-background p-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <VariantField label="Loại biến thể cha">
              <Input required value={group.name} disabled={disabled} placeholder="Màu sắc" onChange={(event) => updateGroup(groupIndex, { name: event.target.value })} />
            </VariantField>
            <VariantField label="Giá trị">
              <Input required value={group.value} disabled={disabled} placeholder="Đen" onChange={(event) => updateGroup(groupIndex, { value: event.target.value })} />
            </VariantField>
            <Button type="button" size="icon-sm" variant="outline" title="Xóa nhóm biến thể" disabled={disabled} onClick={() => commit(groups.filter((_, index) => index !== groupIndex))} className="self-end text-destructive hover:text-destructive">
              <Trash2 />
            </Button>
          </div>

          <div className="space-y-2 border-l-2 border-orange-200 pl-3">
            {group.children.map((child, childIndex) => (
              <div key={child.key} className="grid gap-2 rounded-lg bg-muted/35 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_1fr_1fr_auto]">
                <VariantField label="Loại con"><Input required value={child.name} disabled={disabled} placeholder="Dung lượng" onChange={(event) => updateChild(groupIndex, childIndex, { name: event.target.value })} /></VariantField>
                <VariantField label="Giá trị"><Input required value={child.value} disabled={disabled} placeholder="256GB" onChange={(event) => updateChild(groupIndex, childIndex, { value: event.target.value })} /></VariantField>
                <VariantField label="SKU" error={skuErrors[child.sku]}><Input required value={child.sku} disabled={disabled} placeholder="IP-BLK-256" aria-invalid={Boolean(skuErrors[child.sku])} onChange={(event) => updateChild(groupIndex, childIndex, { sku: event.target.value })} /></VariantField>
                <VariantField label="Giá"><Input required type="number" min="0" value={child.unitPrice} disabled={disabled} onChange={(event) => updateChild(groupIndex, childIndex, { unitPrice: Number(event.target.value) })} /></VariantField>
                <VariantField label="Tồn kho"><Input required type="number" min="0" step="1" value={child.stock} disabled={disabled} onChange={(event) => updateChild(groupIndex, childIndex, { stock: Number(event.target.value) })} /></VariantField>
                <Button type="button" size="icon-sm" variant="ghost" title="Xóa biến thể con" disabled={disabled || group.children.length === 1} onClick={() => updateGroup(groupIndex, { children: group.children.filter((_, index) => index !== childIndex) })} className="self-end text-destructive hover:text-destructive">
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={() => updateGroup(groupIndex, { children: [...group.children, newChild()] })}>
              <Plus /> Thêm biến thể con
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}

function VariantField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-[11px]">{label}</Label>{children}{error && <p className="text-[11px] text-destructive">{error}</p>}</div>;
}
