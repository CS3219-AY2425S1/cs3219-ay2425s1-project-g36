import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/common/PageHeader";
import { getUserAttempts } from "@/api/user-service/UserService";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import MainContainer from "@/components/common/MainContainer";

export interface Attempt {
  id: string;
  timeSubmitted: Date;
  questionTitle: string;
  questionId: number;
  language: string;
  code: string;
}

const DEFAULT_ITEMS_PER_PAGE = 10;
const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];

export default function AttemptedHistoryPage() {
  const [attemptedQuestions, setAttemptedQuestions] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(DEFAULT_ITEMS_PER_PAGE);

  const { auth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const loadAttemptHistory = async () => {
      try {
        setIsLoading(true);
        const result = await getUserAttempts(auth.id);
        
        if (result.status === 200) {
          setAttemptedQuestions(result.data.sort((a: Attempt, b: Attempt) => new Date(b.timeSubmitted).getTime() - new Date(a.timeSubmitted).getTime()));
          setError("");
          setTotalPages(Math.ceil(result.data.length / itemsPerPage));
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error("Error fetching attempt history:", err);
        setError("Failed to fetch attempt history.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAttemptHistory();
  }, [location, itemsPerPage]); // Add itemsPerPage to dependencies to recalculate pages when it changes

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error}</div>;

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = attemptedQuestions.slice(startIdx, startIdx + itemsPerPage);

  const singlePage = attemptedQuestions.length <= itemsPerPage;

  return (
    <>
      <PageHeader />
      <div className="container mx-auto p-6 pb-32">
        <h1 className="text-3xl font-bold mb-6">Submission History</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/4">
            <Table className="rounded-2xl">
              <TableHeader className="bg-black-100">
                <TableRow>
                  <TableHead>Question ID</TableHead>
                  <TableHead>Time since attempt</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Language</TableHead>
                </TableRow>
              </TableHeader>
              {attemptedQuestions.length >= 1 ? (
                <TableBody>
                  {paginatedQuestions.map((question) => (
                    <TableRow key={question.id} className="border-b border-black-300 h-16">
                      <TableCell className="px-4 py-1 text-muted-foreground">
                        {question.questionId}
                      </TableCell>
                      <TableCell className="px-4 py-1 text-muted-foreground">
                        {formatDistanceToNow(new Date(question.timeSubmitted), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="px-4 py-1">
                        <Link
                          to={`/attempts/${question.questionId}/${question.timeSubmitted}`}
                          className="text-blue-500 hover:text-blue-700 hover:underline"
                        >
                          {question.questionTitle}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 py-1 text-muted-foreground">
                        {question.language}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <MainContainer className="px-4 text-center gap-3 flex flex-col">
                  <h2 className="text-2xl">
                    No questions attempted yet...
                  </h2>
                </MainContainer>
              )}
            </Table>
            {attemptedQuestions.length >= 1 ? (
              <div className="mt-4 flex justify-between items-center flex-wrap">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-32">
                    {itemsPerPage} / page
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={5}
                  avoidCollisions={false} // Disable automatic flipping
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => handleItemsPerPageChange(option)}
                    >
                      {option} / page
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center space-x-2 mt-2 lg:mt-0">
                <span>Page {singlePage ? 1 : currentPage} of {singlePage ? 1 : totalPages}</span>
                <Button onClick={handlePreviousPage} disabled={singlePage || currentPage === 1}>
                  Previous
                </Button>
                <Button onClick={handleNextPage} disabled={singlePage || currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
            ) : null }
          </div>
        </div>
      </div>
    </>
  );
}
