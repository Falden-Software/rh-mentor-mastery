
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, Loader2 } from "lucide-react";
import { TestData } from "@/types/models";

interface GenericTestCardProps {
  test: TestData;
  isStarting: boolean;
  onStartTest: (test: TestData) => void;
  onViewResults: (testId: string) => void;
}

const GenericTestCard = ({ test, isStarting, onStartTest, onViewResults }: GenericTestCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-4">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={test.status === "concluído" ? 
            "bg-green-50 text-green-600 border-green-200" : 
            "bg-amber-50 text-amber-600 border-amber-200"}>
            {test.status}
          </Badge>
          <div className="flex items-center text-muted-foreground">
            {test.status === "concluído" ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                <span className="text-xs text-green-600">
                  Realizado: {test.completedDate}
                </span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-1 text-amber-600" />
                <span className="text-xs text-amber-600">Prazo: {test.dueDate}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3 mt-3">
          <div className="bg-purple-100 p-2 rounded-md">
            <test.icon className="h-6 w-6 text-brand-teal" />
          </div>
          <div>
            <CardTitle className="text-lg">{test.title}</CardTitle>
            <CardDescription className="mt-1">{test.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">
                {test.status === "concluído" ? "100%" : (test.startedAt ? "Iniciado" : "0%")}
              </span>
            </div>
            <Progress value={test.status === "concluído" ? 100 : (test.startedAt ? 30 : 0)} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>Tempo estimado: {test.timeEstimate}</span>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-brand-teal border-brand-teal/20">
              {test.category}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-gray-50 py-3">
        {test.status === "concluído" ? (
          <Button variant="outline" className="w-full" onClick={() => onViewResults(test.id)}>
            Ver Resultados
          </Button>
        ) : (
          <Button 
            className="w-full bg-brand-teal hover:bg-brand-teal/90" 
            onClick={() => onStartTest(test)}
            disabled={isStarting}
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : test.startedAt ? "Continuar Teste" : "Iniciar Teste"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GenericTestCard;
