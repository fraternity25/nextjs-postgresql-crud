import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function useCurrentUser() {
  const { data, error, isLoading } = useSWR("/api/user/me", fetcher);
  return {
    user: data,
    loading: isLoading,
    error,
  };
}
