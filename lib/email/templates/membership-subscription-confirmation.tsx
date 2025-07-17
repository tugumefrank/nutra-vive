import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface MembershipSubscriptionConfirmationEmailProps {
  membershipTier: string;
  price: number;
  nextBillingDate: string;
  userEmail: string;
  userName: string;
  productAllocations: Array<{
    categoryName: string;
    quantity: number;
  }>;
}

export default function MembershipSubscriptionConfirmationEmail({
  membershipTier = "Premium",
  price = 29.99,
  nextBillingDate = "2024-02-15",
  userEmail = "customer@example.com",
  userName = "John Doe",
  productAllocations = [],
}: MembershipSubscriptionConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to your {membershipTier} membership!</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://nutraviveholistic.com/logo.png"
                width="160"
                height="48"
                alt="Nutra-Vive"
                className="my-0 mx-auto"
              />
            </Section>
            
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Welcome to your <strong>{membershipTier}</strong> membership!
            </Heading>
            
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {userName},
            </Text>
            
            <Text className="text-black text-[14px] leading-[24px]">
              Congratulations! Your {membershipTier} membership subscription has been successfully activated. 
              You now have access to exclusive benefits and premium products.
            </Text>

            <Section className="my-[32px]">
              <Text className="text-black text-[16px] font-semibold leading-[24px] mb-[16px]">
                Your Membership Details:
              </Text>
              
              <div className="bg-[#f6f6f6] rounded-[4px] p-[16px]">
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  <strong>Membership Tier:</strong> {membershipTier}
                </Text>
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  <strong>Monthly Price:</strong> ${price.toFixed(2)}
                </Text>
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  <strong>Next Billing Date:</strong> {nextBillingDate}
                </Text>
              </div>
            </Section>

            {productAllocations.length > 0 && (
              <Section className="my-[32px]">
                <Text className="text-black text-[16px] font-semibold leading-[24px] mb-[16px]">
                  Your Monthly Allocations:
                </Text>
                
                <div className="bg-[#f6f6f6] rounded-[4px] p-[16px]">
                  {productAllocations.map((allocation, index) => (
                    <Text key={index} className="text-black text-[14px] leading-[24px] m-0">
                      • {allocation.quantity} {allocation.categoryName} products
                    </Text>
                  ))}
                </div>
              </Section>
            )}

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px]"
                href="https://nutraviveholistic.com/account/memberships"
              >
                Manage Your Membership
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              You can manage your membership, update payment methods, or view your usage 
              by visiting your account dashboard.
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you have any questions about your membership, please don't hesitate to 
              contact our support team at{" "}
              <Link href="mailto:support@nutraviveholistic.com" className="text-blue-600 no-underline">
                support@nutraviveholistic.com
              </Link>
            </Text>
            
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Thank you for choosing Nutra-Vive for your wellness journey!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}