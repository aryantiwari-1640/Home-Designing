import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Navbar from "../../components/Navbar";
import Upload from "../../components/Upload";
import { ArrowRight, ArrowUpRight, Clock, DeleteIcon, Layers, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import { useNavigate, useOutletContext } from "react-router";
import { useEffect, useRef, useState } from "react";
import type { AuthContext, DesignItem } from "../../type";
import { createProject, deleteProject, getProjects } from "../../lib/puter.action";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const isCreatingProjectRef = useRef(false);
  const { isSignedIn, userId } = useOutletContext<AuthContext>();

  const handleUploadComplete = async (base64Image: string) => {
    try {
      if (isCreatingProjectRef.current) return false;
      const newId = Date.now().toString();
      const name = `Residence ${newId}`;
      const newItem = {
        id: newId,
        name,
        sourceImage: base64Image,
        renderedImage: undefined,
        timestamp: Date.now(),
        ownerId: userId,
        isPublic: false,
      }

      const saved = await createProject({ item: newItem ,visibility:"private"});
      if (saved==null) {
        console.error("Failed to create project");
        return false;
      }
      setProjects((prev) => [saved, ...prev]);
      navigate(`/visualizer/${newId}`, {
        state: {
          initialImage: saved.sourceImage,
          initialRendered: saved.renderedImage || null,
          name
        }
      });
      return true;
    } finally {
      isCreatingProjectRef.current = false;
    }
  }

useEffect(() => {
   console.log("SIGNED IN:", isSignedIn);
  console.log("USER ID:", userId);

  const fetchProjects = async () => {

    const items = await getProjects();

    if (!isSignedIn) {
      console.log("Items",items);

      setProjects(

        (items || []).filter(
          project => project.isPublic === true
        )
      );

      return;
    }

    setProjects(items || []);
  };

  fetchProjects();

}, [isSignedIn, userId]);

  return (
    <div className="home"><Navbar />
      <section className="hero">
        <div className="announce">
          <div className="pulse">
          </div>
          <p>Introducing Roomique</p>
        </div>

        <h1>Build Beautiful Spaces and Experiences</h1>
        <p className="subtitle">Design and Visualize your dream home with our intuitive tools and expert guidance.</p>

        <div className="actions">
          <a href="#upload" className="cta">Get Started<ArrowRight className="icon" /></a>
          <Button variant="outline" className="demo" size="lg">Watch Demo</Button>
        </div>

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>Upload your floor plan</h3>
              <p>Supports JPG,PNG,formats up to 10MB</p>
            </div>

            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>


      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p> Your latest work and shared community projects , all in one place</p>
            </div>
          </div>
          <div className="projects-grid">
            {projects
              .filter(project => {
                if (project.isPublic) return true;

                return (
                  isSignedIn &&
                  !!userId &&
                  project.ownerId === userId
                );
              })
              .map(({ id, name, renderedImage, sourceImage, timestamp ,isPublic}) => (
                <div key={id} className="project-card group" onClick={() => navigate(`/visualizer/${id}`)}>
                  <div className="preview">
                    <img src={renderedImage || sourceImage} alt="Project"></img>
                    <div className="badge">
                      <span>{isPublic?"Community":"Private"}</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div>
                      <h3>
                        {name}
                      </h3>
                      <div className="meta">
                        <Clock size={12} />
                        <span>{new Date(timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="arrow">
                      <ArrowUpRight size={18} />
                    </div>
                    <button
                      className="arrow"
                      onClick={async (e) => {
                        e.stopPropagation();

                        const confirmed = window.confirm(
                          "Delete this project?"
                        );

                        if (!confirmed) return;

                        const success = await deleteProject(id);
                        if (success) {
                          setProjects(prev =>
                            prev.filter(project => project.id !== id)
                          );
                        }

                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

              ))}
          </div>

        </div>
      </section>
    </div>);
}
