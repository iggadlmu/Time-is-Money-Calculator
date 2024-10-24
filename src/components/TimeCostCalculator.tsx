import React, { useState } from 'react';
import { DollarSign, Clock, ShoppingCart, Hourglass } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';
import { InputField } from './InputField';

// Define the structure of the result
interface CalculationResult {
  isRecurring: boolean;
  hourlyRate: string;
  monthlyHours?: string;
  monthlyDays?: string;
  yearlyHours?: string;
  yearlyDays?: string;
  hours?: string;
  minutes?: string;
  days?: string;
}

const TimeCostCalculator = () => {
  const [yearlyIncome, setYearlyIncome] = useState('');
  const [dailyHours, setDailyHours] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setYearlyIncome(value);
  };

  const validateInputs = () => {
    const income = parseFloat(yearlyIncome);
    const hours = parseFloat(dailyHours);
    const price = parseFloat(itemPrice);

    if (!yearlyIncome) return "Enter your annual net income";
    if (!dailyHours) return "What are your daily work hours?";
    if (!itemPrice) return "Enter the price as a whole number";
    
    if (isNaN(income) || income <= 0) return "Please enter a valid yearly income";
    if (isNaN(hours) || hours <= 0 || hours > 24) return "Please enter valid daily hours (between 0 and 24)";
    if (isNaN(price) || price <= 0) return "Please enter a valid price";

    return null;
  };

  const formatTime = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const hrs = Math.floor(hours);
      const minutes = Math.round((hours - hrs) * 60);
      return minutes > 0
        ? `${hrs} hour${hrs !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`
        : `${hrs} hour${hrs !== 1 ? 's' : ''}`;
    }
  };

  const calculateWorkingHours = () => {
    setError(null);
    const validationError = validateInputs();
    
    if (validationError) {
      setError(validationError);
      return;
    }

    const yearlyIncomeNum = parseFloat(yearlyIncome);
    const dailyHoursNum = parseFloat(dailyHours);
    const price = parseFloat(itemPrice);
    const userAnnualHours = dailyHoursNum * 5 * 52; // Assuming 5 workdays a week
    const hourlyEarnings = yearlyIncomeNum / userAnnualHours;

    const workingHours = price / hourlyEarnings;

    if (isRecurring) {
      const monthlyWorkingHours = price / hourlyEarnings;
      const yearlyWorkingHours = monthlyWorkingHours * 12;
      
      const monthlyTime = formatTime(monthlyWorkingHours);
      const yearlyTime = formatTime(yearlyWorkingHours);

      const monthlyShifts = monthlyWorkingHours < dailyHoursNum
        ? `Less than 1 shift of ${dailyHoursNum} hours`
        : `${(monthlyWorkingHours / dailyHoursNum).toFixed(1)} shifts of ${dailyHoursNum} hours`;

      const yearlyShifts = yearlyWorkingHours < dailyHoursNum
        ? `Less than 1 shift of ${dailyHoursNum} hours`
        : `${(yearlyWorkingHours / dailyHoursNum).toFixed(1)} shifts of ${dailyHoursNum} hours and ${(yearlyWorkingHours % dailyHoursNum).toFixed(0)} minutes of overtime`;

      setResult({
        isRecurring: true,
        monthlyHours: monthlyTime,
        monthlyDays: monthlyShifts,
        yearlyHours: yearlyTime,
        yearlyDays: yearlyShifts,
        hourlyRate: hourlyEarnings.toFixed(2)
      });
    } else {
      let workingTime: string | undefined;
      let workingDays: string | undefined;

      if (workingHours < 1) {
        const minutes = (workingHours * 60).toFixed(0);
        workingTime = `${minutes} minutes`;
        workingDays = `Less than 1 shift of ${dailyHoursNum} hours`;
      } else {
        const hours = Math.floor(workingHours);
        const minutes = Math.round((workingHours - hours) * 60);
        workingTime = `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
        
        workingDays = (workingHours / dailyHoursNum).toFixed(1);
        if (workingDays === "0.0") {
          workingDays = `Less than 1 shift of ${dailyHoursNum} hours`;
        } else {
          workingDays = `${workingDays} shifts of ${dailyHoursNum} hours`;
        }
      }

      setResult({
        isRecurring: false,
        hours: workingTime,
        days: workingDays,
        hourlyRate: hourlyEarnings.toFixed(2)
      });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setIsRecurring(checked);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Hourglass className="w-6 h-6 text-primary" />
          Money is Time Calculator
        </CardTitle>
        <CardDescription>
          Uncover the true cost of products and services by translating their prices into the work effort they represent for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputField
          id="yearly-income"
          label="Annual Net Income"
          icon={<DollarSign className="w-4 h-4" />}
          value={yearlyIncome}
          onChange={handleIncomeChange}
          placeholder="Enter your annual net income"
        />

        <InputField
          id="daily-hours"
          label="Daily Working Hours"
          icon={<Clock className="w-4 h-4" />}
          value={dailyHours}
          onChange={(e) => setDailyHours(e.target.value)}
          placeholder="What are your daily work hours?"
          type="number"
          min="0"
          max="24"
        />

        <InputField
          id="item-price"
          label="Product/Service Price"
          icon={<ShoppingCart className="w-4 h-4" />}
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          placeholder="Enter the price as a whole number"
          type="number"
          min="0"
        />

        <div className="flex items-center space-x-2 bg-secondary/50 p-3 rounded-lg">
          <Checkbox 
            id="recurring" 
            checked={isRecurring} 
            onCheckedChange={handleCheckboxChange}
            className="bg-background border-primary"
          />
          <Label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
            Recurring Monthly Payment
          </Label>
        </div>

        <Button
          onClick={calculateWorkingHours}
          className="w-full"
          variant="default"
        >
          <Clock className="w-4 h-4 mr-2" />
          Show Me The Time Price Tag
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && !error && (
          <Alert className="bg-primary/10 border-primary">
            <AlertDescription>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Your hourly earnings: {formatCurrency(result.hourlyRate)}/hour
                </p>
                
                <p className="font-medium text-primary flex items-center">
                  How much time you’re investing: <Clock className="w-4 h-4 ml-1" />
                </p>

                {result.isRecurring ? (
                  <>
                    <p>Monthly: {result.monthlyHours} on the job </p>
                    <p>Yearly: {result.yearlyHours} on the job </p>
                  </>
                ) : (
                  <p>{result.hours} on the job </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeCostCalculator;
