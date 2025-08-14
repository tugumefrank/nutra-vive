// app/test-usps/page.tsx - Create this file to test your USPS API

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  validateAndCorrectAddress,
  lookupCityState,
} from "@/lib/actions/address-actions";

export default function USPSTestPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    streetAddress: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
  });

  const testAddressValidation = async () => {
    setLoading(true);
    try {
      const addressData = new FormData();
      addressData.append("streetAddress", formData.streetAddress);
      addressData.append("city", formData.city);
      addressData.append("state", formData.state);
      addressData.append("ZIPCode", formData.zipCode);

      console.log("🧪 Testing address validation with:", formData);
      const result = await validateAndCorrectAddress(addressData);
      console.log("🧪 Test result:", result);

      setTestResults({
        type: "address_validation",
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Test failed:", error);
      setTestResults({
        type: "error",
        result: { success: false, error: error.message },
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const testCityStateLookup = async () => {
    setLoading(true);
    try {
      console.log("🧪 Testing city/state lookup with ZIP:", formData.zipCode);
      const result = await lookupCityState(formData.zipCode);
      console.log("🧪 City/State result:", result);

      setTestResults({
        type: "city_state_lookup",
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("City/State test failed:", error);
      setTestResults({
        type: "error",
        result: { success: false, error: error.message },
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">USPS API Test Page</h1>
        <p className="text-gray-600">
          Test your USPS API integration and debug connection issues.
        </p>
      </div>

      {/* Environment Check */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Environment Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">USPS_CLIENT_ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    process.env.NEXT_PUBLIC_USPS_CLIENT_ID
                      ? "default"
                      : "destructive"
                  }
                >
                  {process.env.NEXT_PUBLIC_USPS_CLIENT_ID ? "Set" : "Missing"}
                </Badge>
                {process.env.NEXT_PUBLIC_USPS_CLIENT_ID && (
                  <span className="text-xs text-gray-500 font-mono">
                    {process.env.NEXT_PUBLIC_USPS_CLIENT_ID.substring(0, 8)}...
                  </span>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">USPS_CLIENT_SECRET</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    process.env.NEXT_PUBLIC_USPS_CLIENT_SECRET
                      ? "default"
                      : "destructive"
                  }
                >
                  {process.env.NEXT_PUBLIC_USPS_CLIENT_SECRET
                    ? "Set"
                    : "Missing"}
                </Badge>
                {process.env.NEXT_PUBLIC_USPS_CLIENT_SECRET && (
                  <span className="text-xs text-gray-500 font-mono">
                    {process.env.NEXT_PUBLIC_USPS_CLIENT_SECRET.substring(0, 8)}
                    ...
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Server-side environment variables won't
              show here. Check your server console for the actual values being
              used.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input
                id="streetAddress"
                value={formData.streetAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    streetAddress: e.target.value,
                  }))
                }
                placeholder="123 Main St"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="New York"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
                placeholder="NY"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, zipCode: e.target.value }))
                }
                placeholder="10001"
                maxLength={5}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={testAddressValidation}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Testing..." : "Test Address Validation"}
            </Button>
            <Button
              onClick={testCityStateLookup}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? "Testing..." : "Test City/State Lookup"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test Results
              <Badge
                variant={testResults.result.success ? "default" : "destructive"}
              >
                {testResults.result.success ? "Success" : "Failed"}
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-500">
              {testResults.type} -{" "}
              {new Date(testResults.timestamp).toLocaleString()}
            </p>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(testResults.result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting Guide */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Common Issues:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>
                <strong>Invalid Client Error:</strong> Your API credentials may
                be incorrect or inactive
              </li>
              <li>
                <strong>404 Errors:</strong> API endpoints may have changed or
                be incorrect
              </li>
              <li>
                <strong>Timeout Errors:</strong> USPS API may be temporarily
                unavailable
              </li>
              <li>
                <strong>Rate Limiting:</strong> Too many requests in a short
                period
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Next Steps:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Verify your USPS Web Tools account is active and approved</li>
              <li>Check that your API key is for the production environment</li>
              <li>
                Confirm your application has been approved for address
                validation services
              </li>
              <li>
                Contact USPS support if credentials appear correct but still
                failing
              </li>
            </ul>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Development vs Production:</strong> Make sure you're using
              production credentials for live sites. USPS has separate sandbox
              and production environments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
