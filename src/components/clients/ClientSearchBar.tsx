
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface ClientSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onInviteClick: () => void;
}

export function ClientSearchBar({ searchQuery, onSearchChange, onInviteClick }: ClientSearchBarProps) {
  return (
    <div className="flex items-center mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button variant="default" className="ml-2" onClick={onInviteClick}>
        <UserPlus className="h-4 w-4 mr-2" />
        Convidar
      </Button>
    </div>
  );
}
