"use client";
import { useMemo, useState } from "react";
import { Slider } from "../components/ui/slider";
import { div, mul, round, sub } from "exact-math";
import { Separator } from "../components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";

export default function Home() {
  // const [state, setState] = useState<{
  //   evConsumption: number;
  //   kwPrice: number;
  //   fuelConsumption: number;
  //   fuelPrice: number;
  // }>({
  //   evConsumption: 20,
  //   kwPrice: 0.39,
  //   fuelConsumption: 7,
  //   fuelPrice: 1.5,
  // });
  const searchParams = useSearchParams();
  const router = useRouter();

  const updateSearchParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null) {
      console.log("delete", key);
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.replace(`/?${params.toString()}`);
  };

  const evConsumption = Number(searchParams.get("evConsumption") ?? "20");
  const kwPrice = Number(searchParams.get("kwPrice") ?? "0.49");
  const chargingHome = searchParams.get("home") === "true";
  const homeKwPrice = Number(searchParams.get("homeKwPrice") ?? "0.29");
  const homeProportion = Number(searchParams.get("homeProportion") ?? "50");
  const fuelConsumption = Number(searchParams.get("fuelConsumption") ?? "7");
  const fuelPrice = Number(searchParams.get("fuelPrice") ?? "1.5");

  const evCostPer100km = useMemo(() => {
    const cost = round(mul(evConsumption, kwPrice), -2);
    const homeCost = round(mul(evConsumption, homeKwPrice), -2);
    const homeProportionToUse = chargingHome ? homeProportion : 0;
    const totalCost = round(
      div(
        mul(cost, 100 - homeProportionToUse) +
          mul(homeCost, homeProportionToUse),
        100
      ),
      -2
    );
    return totalCost;
  }, [chargingHome, evConsumption, homeKwPrice, homeProportion, kwPrice]);
  const fossilCostPer100km = round(mul(fuelConsumption, fuelPrice), -2);

  const differencePercentage = round(
    div(mul(sub(evCostPer100km, fossilCostPer100km), 100), fossilCostPer100km),
    -2
  );

  const differencePrice = round(sub(evCostPer100km, fossilCostPer100km), -2);

  return (
    <div className="flex min-h-screen flex-col items-center p-6 md:p-24">
      <div className="text-xl font-semibold">EV car</div>
      <div className="text-lg font-semibold mt-6 mb-3">
        EV consumption: {evConsumption}kw/100km
      </div>
      <Slider
        defaultValue={[evConsumption]}
        min={0.1}
        max={30}
        step={0.1}
        onValueChange={([value]) =>
          updateSearchParams("evConsumption", value.toString())
        }
      />
      <div className="text-lg font-semibold mt-6 mb-3">
        Price: {kwPrice}€/kw
      </div>
      <Slider
        defaultValue={[kwPrice]}
        min={0.01}
        max={1.5}
        step={0.01}
        onValueChange={([value]) =>
          updateSearchParams("kwPrice", value.toString())
        }
      />
      <Button
        variant="secondary"
        size="sm"
        className="mt-6"
        onClick={() => {
          updateSearchParams("home", chargingHome ? null : "true");
        }}
      >
        {chargingHome ? "Not charging home" : "Charging home"}
      </Button>
      {chargingHome && (
        <>
          <div className="text-lg font-semibold mt-6 mb-3">
            Home charging price: {homeKwPrice}€/kw
          </div>
          <Slider
            defaultValue={[homeKwPrice]}
            min={0.01}
            max={1.5}
            step={0.01}
            onValueChange={([value]) =>
              updateSearchParams("homeKwPrice", value.toString())
            }
          />
          <div className="text-lg font-semibold mt-6 mb-3">
            Home charging proportion: {homeProportion}%
          </div>
          <Slider
            defaultValue={[homeProportion]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) =>
              updateSearchParams("homeProportion", value.toString())
            }
          />
        </>
      )}
      <Separator className="mt-10" />
      <div className="text-xl font-semibold mt-6">Fossil car</div>
      <div className="text-lg font-semibold mt-6 mb-3">
        Fuel consumption: {fuelConsumption} litres/100km
      </div>
      <Slider
        defaultValue={[fuelConsumption]}
        min={2}
        max={30}
        step={0.1}
        onValueChange={([value]) =>
          updateSearchParams("fuelConsumption", value.toString())
        }
      />
      <div className="text-lg font-semibold mt-6 mb-3">
        Fuel price: {fuelPrice}€/litre
      </div>
      <Slider
        defaultValue={[fuelPrice]}
        min={0.5}
        max={3}
        step={0.01}
        onValueChange={([value]) =>
          updateSearchParams("fuelPrice", value.toString())
        }
      />
      <Table className="mt-10 text-lg">
        <TableHeader className="font-semibold">
          <TableRow>
            <TableHead>Compare</TableHead>
            <TableHead>EV</TableHead>
            <TableHead>Fossil</TableHead>
            <TableHead>Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-semibold">Cost per 100km</TableCell>
            <TableCell>{evCostPer100km}€</TableCell>
            <TableCell>{fossilCostPer100km}€</TableCell>
            <TableCell>
              {differencePrice}€ ({differencePercentage}%)
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold">Cost per 1km</TableCell>
            <TableCell>{round(div(evCostPer100km, 100), -4)}€</TableCell>
            <TableCell>{round(div(fossilCostPer100km, 100), -4)}€</TableCell>
            <TableCell>
              {round(div(differencePrice, 100), -4)}€ (
              {round(div(differencePercentage, 100), -4)}%)
            </TableCell>
          </TableRow>
        </TableBody>
        {/* <TableHeader className="font-semibold">
          <TableRow>
            <TableHead>Difference</TableHead>
            <TableHead>in %</TableHead>
            <TableHead>in €</TableHead>
           
          </TableRow>
        </TableHeader> */}
        {/* <TableBody>
          <TableCell></TableCell>
          <TableCell>
            {round(
              div(
                mul(sub(evCostPer100km, fossilCostPer100km), 100),
                fossilCostPer100km
              ),
              -2
            )}
            %
          </TableCell>
          <TableCell>
            {round(sub(evCostPer100km, fossilCostPer100km), -2)}€
          </TableCell>
        </TableBody> */}
      </Table>
    </div>
  );
}
