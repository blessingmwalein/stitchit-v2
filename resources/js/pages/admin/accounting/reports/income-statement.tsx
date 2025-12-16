import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Download, Printer } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

interface Account {
    id: number;
    code: string;
    name: string;
    balance: number;
}

interface Props {
    // Income Statement
    revenueAccounts?: Account[];
    cogsAccounts?: Account[];
    expenseAccounts?: Account[];
    totalRevenue?: number;
    totalCOGS?: number;
    totalExpenses?: number;
    grossProfit?: number;
    netIncome?: number;

    // Balance Sheet
    assetAccounts?: Account[];
    liabilityAccounts?: Account[];
    equityAccounts?: Account[];
    totalAssets?: number;
    totalLiabilities?: number;
    totalEquity?: number;
    asOfDate?: string;

    // Manufacturing Account
    rawMaterialsUsed?: number;
    directLabor?: number;
    manufacturingOverhead?: number;
    totalManufacturingCost?: number;

    dateFrom?: string;
    dateTo?: string;
}

export default function ReportsPage(props: Props) {
    const [dateFrom, setDateFrom] = React.useState<Date | undefined>(props.dateFrom ? new Date(props.dateFrom) : undefined);
    const [dateTo, setDateTo] = React.useState<Date | undefined>(props.dateTo ? new Date(props.dateTo) : undefined);
    const [activeTab, setActiveTab] = React.useState('income-statement');

    const handleApplyFilter = () => {
        const params: any = {};
        if (dateFrom) params.date_from = format(dateFrom, 'yyyy-MM-dd');
        if (dateTo) params.date_to = format(dateTo, 'yyyy-MM-dd');

        if (activeTab === 'income-statement') {
            router.get('/admin/accounting/reports/income-statement', params);
        } else if (activeTab === 'balance-sheet') {
            router.get('/admin/accounting/reports/balance-sheet', params);
        } else if (activeTab === 'manufacturing') {
            router.get('/admin/accounting/reports/manufacturing-account', params);
        }
    };

    return (
        <AppLayout>
            <Head title="Financial Reports" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
                        <p className="text-muted-foreground">
                            View comprehensive financial statements and reports
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Date Filter */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium">From Date</label>
                                <DatePicker
                                    date={dateFrom}
                                    onDateChange={setDateFrom}
                                    placeholder="Select from date"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium">To Date</label>
                                <DatePicker
                                    date={dateTo}
                                    onDateChange={setDateTo}
                                    placeholder="Select to date"
                                />
                            </div>
                            <Button onClick={handleApplyFilter}>Apply</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
                        <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
                        <TabsTrigger value="manufacturing">Manufacturing Account</TabsTrigger>
                    </TabsList>

                    {/* Income Statement Tab */}
                    <TabsContent value="income-statement" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Income Statement</CardTitle>
                                <CardDescription>
                                    For the period {formatDate(props.dateFrom || '')} to {formatDate(props.dateTo || '')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Revenue Section */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Revenue</h3>
                                    <div className="space-y-2">
                                        {props.revenueAccounts?.map((account) => (
                                            <div key={account.id} className="flex justify-between text-sm pl-4">
                                                <span className="text-muted-foreground">
                                                    {account.code} - {account.name}
                                                </span>
                                                <span>{formatCurrency(account.balance)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-semibold border-t pt-2">
                                            <span>Total Revenue</span>
                                            <span>{formatCurrency(props.totalRevenue || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cost of Goods Sold */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Cost of Goods Sold</h3>
                                    <div className="space-y-2">
                                        {props.cogsAccounts?.map((account) => (
                                            <div key={account.id} className="flex justify-between text-sm pl-4">
                                                <span className="text-muted-foreground">
                                                    {account.code} - {account.name}
                                                </span>
                                                <span>{formatCurrency(account.balance)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-semibold border-t pt-2">
                                            <span>Total COGS</span>
                                            <span>{formatCurrency(props.totalCOGS || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Gross Profit */}
                                <div className="flex justify-between text-lg font-bold border-t-2 pt-3">
                                    <span>Gross Profit</span>
                                    <span className={(props.grossProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {formatCurrency(props.grossProfit || 0)}
                                    </span>
                                </div>

                                {/* Operating Expenses */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Operating Expenses</h3>
                                    <div className="space-y-2">
                                        {props.expenseAccounts?.map((account) => (
                                            <div key={account.id} className="flex justify-between text-sm pl-4">
                                                <span className="text-muted-foreground">
                                                    {account.code} - {account.name}
                                                </span>
                                                <span>{formatCurrency(account.balance)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-semibold border-t pt-2">
                                            <span>Total Operating Expenses</span>
                                            <span>{formatCurrency(props.totalExpenses || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Net Income */}
                                <div className="flex justify-between text-xl font-bold border-t-2 border-double pt-4">
                                    <span>Net Income</span>
                                    <span className={(props.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {formatCurrency(props.netIncome || 0)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Balance Sheet Tab */}
                    <TabsContent value="balance-sheet" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Balance Sheet</CardTitle>
                                <CardDescription>
                                    As of {formatDate(props.asOfDate || props.dateTo || '')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Assets */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Assets</h3>
                                    <div className="space-y-2">
                                        {props.assetAccounts?.map((account) => (
                                            <div key={account.id} className="flex justify-between text-sm pl-4">
                                                <span className="text-muted-foreground">
                                                    {account.code} - {account.name}
                                                </span>
                                                <span>{formatCurrency(account.balance)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-semibold border-t pt-2">
                                            <span>Total Assets</span>
                                            <span>{formatCurrency(props.totalAssets || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Liabilities */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Liabilities</h3>
                                    <div className="space-y-2">
                                        {props.liabilityAccounts?.map((account) => (
                                            <div key={account.id} className="flex justify-between text-sm pl-4">
                                                <span className="text-muted-foreground">
                                                    {account.code} - {account.name}
                                                </span>
                                                <span>{formatCurrency(account.balance)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-semibold border-t pt-2">
                                            <span>Total Liabilities</span>
                                            <span>{formatCurrency(props.totalLiabilities || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Equity */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Owner's Equity</h3>
                                    <div className="space-y-2">
                                        {props.equityAccounts?.map((account) => (
                                            <div key={account.id} className="flex justify-between text-sm pl-4">
                                                <span className="text-muted-foreground">
                                                    {account.code} - {account.name}
                                                </span>
                                                <span>{formatCurrency(account.balance)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-semibold border-t pt-2">
                                            <span>Total Equity</span>
                                            <span>{formatCurrency(props.totalEquity || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Liabilities + Equity */}
                                <div className="flex justify-between text-xl font-bold border-t-2 border-double pt-4">
                                    <span>Total Liabilities + Equity</span>
                                    <span>{formatCurrency((props.totalLiabilities || 0) + (props.totalEquity || 0))}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Manufacturing Account Tab */}
                    <TabsContent value="manufacturing" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manufacturing Account</CardTitle>
                                <CardDescription>
                                    For the period {formatDate(props.dateFrom || '')} to {formatDate(props.dateTo || '')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm pl-4">
                                        <span className="text-muted-foreground">Raw Materials Used</span>
                                        <span>{formatCurrency(props.rawMaterialsUsed || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pl-4">
                                        <span className="text-muted-foreground">Direct Labor</span>
                                        <span>{formatCurrency(props.directLabor || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pl-4">
                                        <span className="text-muted-foreground">Manufacturing Overhead</span>
                                        <span>{formatCurrency(props.manufacturingOverhead || 0)}</span>
                                    </div>

                                    <div className="flex justify-between text-xl font-bold border-t-2 pt-4">
                                        <span>Total Manufacturing Cost</span>
                                        <span>{formatCurrency(props.totalManufacturingCost || 0)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
