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

interface AdminNewMembershipEmailProps {
  membershipTier: string;
  price: number;
  userEmail: string;
  userName: string;
  subscriptionId: string;
  startDate: string;
  nextBillingDate: string;
  productAllocations: Array<{
    categoryName: string;
    quantity: number;
  }>;
}

export default function AdminNewMembershipEmail({
  membershipTier = "Premium",
  price = 29.99,
  userEmail = "customer@example.com",
  userName = "John Doe",
  subscriptionId = "sub_1234567890",
  startDate = "2024-01-15",
  nextBillingDate = "2024-02-15",
  productAllocations = [],
}: AdminNewMembershipEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New {membershipTier} membership subscription from {userName}</Preview>
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
              New <strong>{membershipTier}</strong> Membership Subscription
            </Heading>
            
            <Text className="text-black text-[14px] leading-[24px]">
              A new membership subscription has been successfully created.
            </Text>

            <Section className="my-[32px]">
              <Text className="text-black text-[16px] font-semibold leading-[24px] mb-[16px]">
                Customer Details:
              </Text>
              
              <div className="bg-[#f6f6f6] rounded-[4px] p-[16px]">
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  <strong>Customer:</strong> {userName}
                </Text>
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  <strong>Email:</strong> {userEmail}
                </Text>
              </div>
            </Section>

            <Section className="my-[32px]">
              <Text className="text-black text-[16px] font-semibold leading-[24px] mb-[16px]">
                Subscription Details:
              </Text>
              
              <div className="bg-[#f6f6f6] rounded-[4px] p-[16px]">
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  <strong>Membership Tier:</strong> {membershipTier}
                </Text>
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  <strong>Monthly Price:</strong> ${price.toFixed(2)}
                </Text>
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  <strong>Subscription ID:</strong> {subscriptionId}
                </Text>
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  <strong>Start Date:</strong> {startDate}
                </Text>
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  <strong>Next Billing Date:</strong> {nextBillingDate}
                </Text>
              </div>
            </Section>

            {productAllocations.length > 0 && (
              <Section className="my-[32px]">
                <Text className="text-black text-[16px] font-semibold leading-[24px] mb-[16px]">
                  Monthly Allocations:
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
                href="https://nutraviveholistic.com/admin/memberships"
              >
                View in Admin Dashboard
              </Button>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This notification was sent from the Nutra-Vive membership system.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}