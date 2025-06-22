import {
  FullLayout,
  LandingLayout,
  MainLayout,
} from "@/components/layout/MainLayout";
import ShopPage from "@/components/shop/ShopPage"; // This is the component from the artifact

export default function Shop() {
  return (
    <LandingLayout>
      <ShopPage />
    </LandingLayout>
  );
}
