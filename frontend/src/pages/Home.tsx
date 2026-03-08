import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, LayoutDashboard, Settings, User, Plus, ChevronRight, BookOpen, PenTool, Wrench, Sparkles, Network, LogOut, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TutorialModules from "@/components/dashboard/TutorialModules";
import StructuredLessonsDashboard from "@/components/dashboard/StructuredLessonsDashboard";
import QuizView from "@/components/dashboard/QuizView";
import GuidedCodingView from "@/components/dashboard/GuidedCodingView";
import ProjectFlowchart from "@/components/dashboard/ProjectFlowchart";

const ProjectItem = ({
  title,
  isActive,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
  isRenaming,
  onRenameSubmit
}: {
  title: string;
  isActive: boolean;
  onClick: () => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  isRenaming?: boolean;
  onRenameSubmit?: (newName: string) => void;
}) => {
  const [editValue, setEditValue] = useState(title);

  const handleSubmit = () => {
    if (onRenameSubmit) {
      onRenameSubmit(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="mb-2">
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onContextMenu={onContextMenu}
        className={`relative w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${isActive
          ? "bg-secondary/80 text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          }`}
      >
        {isRenaming ? (
          <input
            autoFocus
            className="font-medium text-sm bg-background border border-border/50 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary w-[140px]"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()} // Prevent triggering project click
          />
        ) : (
          <span className="font-medium text-sm truncate">{title}</span>
        )}
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
  const [hoveredSidebarProject, setHoveredSidebarProject] = useState<string | null>(null);
  const [hoveredY, setHoveredY] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<string>("dashboard"); // 'dashboard', 'tutorial-modules', 'structured-lessons', 'quiz', 'guided-coding'
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  // Determine which project to display in the secondary sidebar
  const displayProject = activeProject || hoveredProject || (isHoveringSidebar ? hoveredSidebarProject : null);

  const handleProjectClick = (title: string) => {
    if (activeProject === title) {
      setActiveProject(null);
    } else {
      setActiveProject(title);
    }
  };

  const [activeTab, setActiveTab] = useState<'lessons' | 'projects'>('lessons');
  const [lessons, setLessons] = useState<string[]>(["React Hook Tutorial"]);
  const [projects, setProjects] = useState<string[]>(["Tic Tac Toe"]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, title: string } | null>(null);
  const [renamingProject, setRenamingProject] = useState<string | null>(null); // Track which project is being renamed

  const handleContextMenu = (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, title });
  };

  const handleRenameInitiate = () => {
    if (!contextMenu) return;
    setRenamingProject(contextMenu.title);
    setContextMenu(null);
  };

  const handleRenameCommit = (oldName: string, newName: string) => {
    setRenamingProject(null);
    if (!newName || newName.trim() === "" || newName === oldName) return;
    
    const currentList = activeTab === 'lessons' ? lessons : projects;
    const setCurrentList = activeTab === 'lessons' ? setLessons : setProjects;

    // Check if new name already exists
    if (currentList.includes(newName.trim())) {
      // Could show toast error here, for now just abort
      return;
    }

    setCurrentList(currentList.map(p => p === oldName ? newName.trim() : p));
    if (activeProject === oldName) setActiveProject(newName.trim());
    if (hoveredProject === oldName) setHoveredProject(newName.trim());
  };

  const handleDeleteProject = () => {
    if (!contextMenu) return;
    const currentList = activeTab === 'lessons' ? lessons : projects;
    const setCurrentList = activeTab === 'lessons' ? setLessons : setProjects;

    if (window.confirm(`Are you sure you want to delete "${contextMenu.title}"?`)) {
      setCurrentList(currentList.filter(p => p !== contextMenu.title));
      if (activeProject === contextMenu.title) setActiveProject(null);
      if (hoveredProject === contextMenu.title) setHoveredProject(null);
    }
    setContextMenu(null);
  };

  return (
    <div 
      className="min-h-screen flex bg-background text-foreground relative overflow-hidden"
      onClick={() => setContextMenu(null)}
    >
      {/* Background elements */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="gradient-orb w-[600px] h-[600px] -top-40 -right-40 opacity-15" />

      {/* Primary Vertical Sidebar Navigation */}
      <aside className="w-64 glass-strong border-r border-border/50 relative z-30 flex flex-col justify-between">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand */}
          <div
            className="h-16 flex-shrink-0 flex items-center px-6 border-b border-border/50 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="font-display font-bold text-xl tracking-tight">
              <span className="text-gradient">DevPath</span>
              <span className="text-foreground"> AI</span>
            </span>
          </div>

          {/* Navigation Menus */}
          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-6 scrollbar-thin space-y-8">
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary transition-colors">
                <LayoutDashboard size={20} />
                <span className="font-medium text-sm">Dashboard</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
                <User size={20} />
                <span className="font-medium text-sm">Profile</span>
              </button>
            </div>

            {/* Sidebar Lists Section */}
            <div>
              <div className="mb-4 flex flex-col gap-3">
                {/* Sliding Toggle */}
                <div className="flex bg-secondary/30 p-1 rounded-lg relative">
                  <div 
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-secondary rounded-md shadow flex border border-border/50 transition-all duration-300 pointer-events-none" 
                    style={{ left: activeTab === 'lessons' ? '4px' : 'calc(50% + 0px)' }}
                  />
                  <button 
                    className={`flex-1 text-xs font-semibold py-1.5 text-center relative z-10 transition-colors ${activeTab === 'lessons' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('lessons')}
                  >
                    Lessons
                  </button>
                  <button 
                    className={`flex-1 text-xs font-semibold py-1.5 text-center relative z-10 transition-colors ${activeTab === 'projects' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('projects')}
                  >
                    Projects
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentList = activeTab === 'lessons' ? lessons : projects;
                    const setCurrentList = activeTab === 'lessons' ? setLessons : setProjects;
                    const prefix = activeTab === 'lessons' ? 'Lesson' : 'Project';
                    let newIndex = currentList.length + 1;
                    while(currentList.includes(`${prefix} ${newIndex}`)) {
                      newIndex++;
                    }
                    setCurrentList([...currentList, `${prefix} ${newIndex}`]);
                  }}
                  className="w-full border-dashed border-border/60 text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 h-9"
                >
                  <Plus size={14} />
                  Add {activeTab === 'lessons' ? 'Lesson' : 'Project'}
                </Button>
              </div>

              <div className="space-y-1">
                {(activeTab === 'lessons' ? lessons : projects).map((title) => (
                  <ProjectItem
                    key={title}
                    title={title}
                    isActive={activeProject === title}
                    onClick={() => handleProjectClick(title)}
                    onMouseEnter={(e) => {
                      setHoveredProject(title);
                      setHoveredSidebarProject(title); // Store this so it persists if we hover the sidebar next
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredY(rect.top + rect.height / 2);
                    }}
                    onMouseLeave={() => setHoveredProject(null)}
                    onContextMenu={(e) => handleContextMenu(e, title)}
                    isRenaming={renamingProject === title}
                    onRenameSubmit={(newName) => handleRenameCommit(title, newName)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border/50 space-y-1">
          <button
            onClick={() => navigate("/auth")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Log out</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
            <Settings size={20} />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </div>
      </aside>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 glass-strong border border-border/50 rounded-xl shadow-2xl py-2 min-w-[160px] flex flex-col"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button 
              onClick={handleRenameInitiate}
              className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-secondary/80 focus:bg-secondary/80 focus:outline-none transition-colors"
            >
              Rename
            </button>
            <div className="h-px bg-border/50 my-1 mx-2" />
            <button 
              onClick={handleDeleteProject}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none transition-colors"
            >
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secondary Dynamic Sidebar */}
      <AnimatePresence>
        {displayProject && (
          <motion.aside
            initial={{ width: 0, opacity: 0, x: -16 }}
            animate={{ width: 256 + 16, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: -16 }}
            className="absolute left-64 z-40 flex flex-col h-fit max-h-[85vh] pl-4"
            style={{ top: hoveredY !== null ? Math.max(16, hoveredY - 150) : 'max(2rem, calc(50% - 40vh))' }}
            onMouseEnter={() => setIsHoveringSidebar(true)}
            onMouseLeave={() => {
              setIsHoveringSidebar(false);
              setHoveredSidebarProject(null);
            }}
          >
            <div className="glass-strong border border-border/50 rounded-2xl flex flex-col w-64 overflow-hidden whitespace-nowrap shadow-2xl h-full">
              <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-border/50">
                <div className="flex-1 overflow-hidden pr-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 truncate">{displayProject}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-secondary/80 flex-shrink-0"
                  onClick={() => {
                    setActiveProject(null);
                    setHoveredProject(null);
                  }}
                >
                  <ChevronLeft size={16} className="text-muted-foreground" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-none">
                {activeTab === 'lessons' && (
                  <>
                    {/* Learn */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1 px-2 pb-0.5 border-b border-border/30">
                        <BookOpen size={12} className="text-primary/70" />
                        Learn
                      </div>
                        <div className="flex flex-col space-y-1 pl-1">
                        <button 
                          onClick={() => setActiveView("tutorial-modules")}
                          className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:shadow-sm transition-all"
                        >
                          Tutorial Modules
                        </button>
                        <button 
                          onClick={() => setActiveView("structured-lessons")}
                          className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:shadow-sm transition-all"
                        >
                          Structured Lessons
                        </button>
                      </div>
                    </div>

                    {/* Practice */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1 px-2 pb-0.5 border-b border-border/30">
                        <PenTool size={12} className="text-accent/70" />
                        Practice
                      </div>
                      <div className="flex flex-col space-y-0.5 pl-1">
                        <button 
                          onClick={() => {
                            setActiveModuleId(null);
                            setActiveView("quiz");
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-md text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:shadow-sm transition-all"
                        >
                          Quizzes
                        </button>
                        <button 
                          onClick={() => {
                            setActiveModuleId(null);
                            setActiveView("coding-tasks-hub");
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-md text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:shadow-sm transition-all"
                        >
                          Coding Tasks
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Build */}
                {activeTab === 'projects' && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1 px-2 pb-0.5 border-b border-border/30">
                      <Wrench size={12} className="text-green-500/70" />
                      Build
                    </div>
                    <div className="flex flex-col space-y-0.5 pl-1">
                      <button className="w-full text-left px-3 py-1.5 rounded-md text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:shadow-sm transition-all">
                        Project Guide
                      </button>
                      <button className="w-full text-left px-3 py-1.5 rounded-md text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:shadow-sm transition-all">
                        Build-with-me Coding
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Mentor */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1 px-2 pb-0.5 border-b border-border/30">
                    <Sparkles size={12} className="text-purple-500/70" />
                    AI Mentor
                  </div>
                  <div className="flex flex-col space-y-0.5 pl-1">
                    <button className="w-full text-left px-3 py-1.5 rounded-md text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:shadow-sm transition-all">
                      Ask Question
                    </button>
                  </div>
                </div>

                {/* Graph */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1 px-2 pb-0.5 border-b border-border/30">
                    <Network size={12} className="text-orange-500/70" />
                    Graph
                  </div>
                  <div className="flex flex-col space-y-0.5 pl-1">
                    <button 
                      onClick={() => setActiveView("project-flowchart")}
                      className="w-full text-left px-3 py-1.5 rounded-md text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:shadow-sm transition-all"
                    >
                      {activeTab === 'projects' ? 'Project Flowchart' : 'Concept Graph'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main 
        className="flex-1 flex flex-col p-8 relative z-10 h-screen overflow-y-auto"
        onClick={() => {
          setActiveProject(null);
          setHoveredProject(null);
        }}
      >
        {activeView === "project-flowchart" ? (
          <ProjectFlowchart />
        ) : activeView === "tutorial-modules" ? (
          <TutorialModules />
        ) : activeView === "structured-lessons" ? (
          <StructuredLessonsDashboard 
            onStartQuiz={(id) => {
              setActiveModuleId(id);
              setActiveView("quiz");
            }}
            onStartCodingTasks={(id) => {
              setActiveModuleId(id);
              setActiveView("guided-coding");
            }}
            onStartGuidedLearning={(id) => {
              setActiveModuleId(id);
              setActiveView("guided-learning");
            }}
            onBackToVideo={() => setActiveView("tutorial-modules")}
          />
        ) : activeView === "coding-tasks-hub" ? (
          <StructuredLessonsDashboard 
            mode="practice"
            onStartQuiz={() => {}}
            onStartCodingTasks={(id) => {
              setActiveModuleId(id);
              setActiveView("guided-coding");
            }}
            onStartGuidedLearning={() => {}}
            onBackToVideo={() => setActiveView("tutorial-modules")}
          />
        ) : activeView === "quiz" ? (
          <QuizView moduleId={activeModuleId} onBack={() => setActiveView("tutorial-modules")} />
        ) : activeView === "guided-coding" ? (
          <GuidedCodingView moduleId={activeModuleId} onBack={() => setActiveView("coding-tasks-hub")} />
        ) : activeView === "guided-learning" ? (
          <div className="flex flex-col h-full fade-in relative">
            <button 
              onClick={() => setActiveView("structured-lessons")} 
              className="absolute top-4 left-4 p-2 rounded-xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all flex items-center justify-center border border-border/50 shadow-sm shrink-0 z-50"
              title="Back to Dashboard"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
              <BookOpen size={64} className="text-muted-foreground/30 mb-6" />
              <h2 className="text-2xl font-bold font-display text-foreground mb-3">Guided Learning</h2>
              <p className="text-muted-foreground bg-secondary/20 p-6 rounded-2xl border border-border/50 shadow-sm">
                This guided learning section is currently empty and will be built out in a future update.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="glass-strong rounded-2xl p-8 max-w-md w-full text-center glow-primary"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="text-primary w-8 h-8" />
              </motion.div>
              
              <h1 className="text-3xl font-display font-bold mb-4">Dashboard</h1>
              <p className="text-muted-foreground mb-8 text-lg">
                Click a module on the sidebar to get started.
              </p>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
