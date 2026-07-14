package builder

import (
	"fmt"
	"os"
	"os/exec"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
)

type Builder struct{}

func NewBuilder() *Builder {
	return &Builder{}
}

func (b *Builder) BuildFromRepo(repoURL, branch string) (string, error) {
	tempDir, err := os.MkdirTemp("", "sandbox-*")
	if err != nil {
		return "", err
	}

	// Clone repo
	_, err = git.PlainClone(tempDir, false, &git.CloneOptions{
		URL:           repoURL,
		ReferenceName: plumbing.ReferenceName("refs/heads/" + branch),
		SingleBranch:  true,
	})
	if err != nil {
		return "", fmt.Errorf("clone failed: %w", err)
	}

	// Run Nixpacks
	cmd := exec.Command("nixpacks", "build", tempDir, "--name", "sandbox-test")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("nixpacks failed: %w", err)
	}

	return "Image built successfully", nil
}

// RunContainer runs the built image
func (b *Builder) RunContainer(imageName string) (string, error) {
	cmd := exec.Command("docker", "run", "-d", "--rm", "-p", "0:3000", imageName)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("docker run failed: %s - %w", string(output), err)
	}

	containerID := string(output)
	return containerID, nil
}
