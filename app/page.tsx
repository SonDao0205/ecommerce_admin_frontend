import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Headphones,
  Laptop,
  Smartphone,
  Watch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/src/features/storefront/components/product-card";
import {
  StoreBenefits,
  StorefrontFooter,
} from "@/src/features/storefront/components/storefront-footer";
import { StorefrontHeader } from "@/src/features/storefront/components/storefront-header";
import {
  mockCategories,
  mockProducts,
} from "@/src/features/storefront/data/storefront.mock";
import { redirect } from "next/dist/client/components/navigation";

export default async function Home() {
  redirect("/login");
}
