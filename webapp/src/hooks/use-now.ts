import { useQuery } from "@tanstack/react-query";

export function useNow() {
    return useQuery({
        queryKey: ["now"],
        queryFn: () => new Date(),
        refetchInterval: 60000,
        refetchOnWindowFocus: "always",
        initialData: new Date(),
    });
}
