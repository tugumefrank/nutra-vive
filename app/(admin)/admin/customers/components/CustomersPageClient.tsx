"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Crown, 
  DollarSign, 
  Mail, 
  Download, 
  Filter,
  Search,
  Send,
  Calendar,
  MapPin,
  ShoppingBag,
  Star
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  getCustomerAnalytics,
  getCustomerSegments,
  getCustomersWithAnalytics,
  sendBulkEmail,
  exportCustomerData,
  type CustomerAnalytics,
  type CustomerSegment,
  type CustomerData,
  type BulkEmailData
} from "@/lib/actions/customerServerActions";

export default function CustomersPageClient() {
  
  // State management
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Selection and bulk actions
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Email modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailData, setEmailData] = useState<BulkEmailData>({
    subject: "",
    content: "",
    recipientType: "all",
    senderName: "Nutra-Vive Team"
  });
  const [emailSending, setEmailSending] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load customers when filters change
  useEffect(() => {
    loadCustomers();
  }, [searchTerm, selectedSegment, currentPage, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, segmentsData] = await Promise.all([
        getCustomerAnalytics(),
        getCustomerSegments()
      ]);
      
      setAnalytics(analyticsData);
      setSegments(segmentsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const result = await getCustomersWithAnalytics(
        currentPage,
        50,
        searchTerm || undefined,
        selectedSegment || undefined,
        sortBy,
        sortOrder
      );
      
      setCustomers(result.customers);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast.error("Failed to load customers");
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    const newSelected = new Set(selectedCustomers);
    if (checked) {
      newSelected.add(customerId);
    } else {
      newSelected.delete(customerId);
    }
    setSelectedCustomers(newSelected);
    setSelectAll(newSelected.size === customers.length);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(new Set(customers.map(c => c._id)));
    } else {
      setSelectedCustomers(new Set());
    }
    setSelectAll(checked);
  };

  const handleSendBulkEmail = async () => {
    try {
      setEmailSending(true);
      
      let finalEmailData = { ...emailData };
      
      if (emailData.recipientType === "custom") {
        finalEmailData.customEmails = Array.from(selectedCustomers).map(id => 
          customers.find(c => c._id === id)?.email
        ).filter(Boolean) as string[];
      } else if (emailData.recipientType === "segment") {
        finalEmailData.segmentId = selectedSegment;
      }

      const result = await sendBulkEmail(finalEmailData);
      
      toast.success(`Email campaign sent! ${result.sentCount} emails delivered${result.failedCount > 0 ? ` (${result.failedCount} failed)` : ""}`);
      
      setEmailModalOpen(false);
      setEmailData({
        subject: "",
        content: "",
        recipientType: "all",
        senderName: "Nutra-Vive Team"
      });
    } catch (error) {
      console.error("Failed to send emails:", error);
      toast.error("Failed to send email campaign");
    } finally {
      setEmailSending(false);
    }
  };

  const handleExportData = async (format: 'csv' | 'json') => {
    try {
      const data = await exportCustomerData(selectedSegment || undefined, format);
      
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${selectedSegment || 'all'}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Customer data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Failed to export data:", error);
      toast.error("Failed to export customer data");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <CustomersSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalCustomers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.newCustomersThisMonth.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.activeSubscribers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.highValueCustomers.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {segments.map((segment) => (
              <Card 
                key={segment.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSegment === segment.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedSegment(selectedSegment === segment.id ? "" : segment.id);
                  setCurrentPage(1);
                }}
              >
                <CardContent className="p-4 text-center">
                  <div 
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div className="font-semibold text-lg">{segment.count}</div>
                  <div className="text-xs font-medium">{segment.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {segment.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Join Date</SelectItem>
                  <SelectItem value="totalSpent">Total Spent</SelectItem>
                  <SelectItem value="totalOrders">Order Count</SelectItem>
                  <SelectItem value="lastOrderDate">Last Order</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Bulk Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send Bulk Email</DialogTitle>
                    <DialogDescription>
                      Send an email campaign to your customers
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="recipient-type">Recipients</Label>
                      <Select
                        value={emailData.recipientType}
                        onValueChange={(value: 'all' | 'segment' | 'custom') => 
                          setEmailData(prev => ({ ...prev, recipientType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Customers</SelectItem>
                          <SelectItem value="segment">Current Segment</SelectItem>
                          <SelectItem value="custom">Selected Customers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={emailData.subject}
                        onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Email subject..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={emailData.content}
                        onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Email content..."
                        rows={6}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sender">Sender Name</Label>
                      <Input
                        id="sender"
                        value={emailData.senderName}
                        onChange={(e) => setEmailData(prev => ({ ...prev, senderName: e.target.value }))}
                        placeholder="Sender name..."
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendBulkEmail} disabled={emailSending}>
                      {emailSending ? "Sending..." : "Send Email"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Select onValueChange={(format: 'csv' | 'json') => handleExportData(format)}>
                <SelectTrigger className="w-32">
                  <Download className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">Export CSV</SelectItem>
                  <SelectItem value="json">Export JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Customers ({customers.length.toLocaleString()})
              {selectedSegment && (
                <Badge variant="secondary" className="ml-2">
                  {segments.find(s => s.id === selectedSegment)?.name}
                </Badge>
              )}
            </CardTitle>
            
            {customers.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedCustomers.size > 0 && `${selectedCustomers.size} selected`}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer._id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  checked={selectedCustomers.has(customer._id)}
                  onCheckedChange={(checked) => handleSelectCustomer(customer._id, checked as boolean)}
                />
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                  {/* Customer Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3">
                      {customer.imageUrl ? (
                        <img
                          src={customer.imageUrl}
                          alt={customer.firstName || customer.email}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {customer.firstName && customer.lastName 
                            ? `${customer.firstName} ${customer.lastName}`
                            : customer.email
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Stats */}
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Orders
                      </div>
                      <div className="font-medium">{customer.totalOrders}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                      <div className="font-medium">{formatCurrency(customer.totalSpent)}</div>
                    </div>
                  </div>

                  {/* Membership */}
                  <div>
                    {customer.activeMembership ? (
                      <Badge 
                        variant="secondary"
                        className="text-xs"
                        style={{ 
                          backgroundColor: customer.activeMembership?.tier === 'elite' ? '#7C2D12' :
                                           customer.activeMembership?.tier === 'vip' ? '#DC2626' :
                                           customer.activeMembership?.tier === 'premium' ? '#059669' : '#6B7280',
                          color: 'white'
                        }}
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        {customer.activeMembership?.tier?.toUpperCase() || 'MEMBER'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        No Membership
                      </Badge>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    {customer.lastShippingLocation && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {customer.lastShippingLocation.city}, {customer.lastShippingLocation.province}
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="text-right">
                    <div className="text-sm">
                      <div className="text-muted-foreground">Joined</div>
                      <div>{formatDate(customer.createdAt)}</div>
                    </div>
                    {customer.lastOrderDate && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Last order: {formatDate(customer.lastOrderDate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {customers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No customers found
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CustomersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-40 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  );
}