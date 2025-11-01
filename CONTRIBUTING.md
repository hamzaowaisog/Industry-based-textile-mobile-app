# Contributing to Hamza Tex

First off, thank you for considering contributing to Hamza Tex! It's people like you that make this project better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by respect and professionalism. By participating, you are expected to uphold this code.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, Node version, .NET version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Provide specific examples to demonstrate the need**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the coding standards
- Include appropriate test coverage
- Update documentation as needed
- End all files with a newline

## Development Setup

### Prerequisites

- Node.js 18+
- .NET 8.0 SDK
- Yarn package manager
- Git

### Backend Setup

```bash
# Navigate to backend
cd backend/HamzaTex.Api

# Restore packages
dotnet restore

# Build the project
dotnet build

# Run the project
dotnet run
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
yarn install

# Start development server
yarn start
```

### Running Tests

```bash
# Backend tests
cd backend/HamzaTex.Api
dotnet test

# Frontend tests
cd frontend
yarn test
```

## Coding Standards

### C# / Backend

- Follow [Microsoft C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- Use async/await for all I/O operations
- Add XML documentation comments for public APIs
- Use meaningful variable and method names
- Keep methods focused and small

Example:
```csharp
/// <summary>
/// Gets an item by its unique identifier
/// </summary>
/// <param name="id">The item's ID</param>
/// <returns>The item if found, null otherwise</returns>
public async Task<Item?> GetItemByIdAsync(int id)
{
    return await _context.Items.FindAsync(id);
}
```

### JavaScript / Frontend

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks
- Use meaningful component and variable names
- Add PropTypes or TypeScript types
- Keep components focused and reusable

Example:
```javascript
const Button = ({ title, onPress, loading = false }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator /> : <Text>{title}</Text>}
    </TouchableOpacity>
  );
};
```

### General Guidelines

- Write self-documenting code
- Add comments for complex logic
- Avoid code duplication
- Write unit tests for new features
- Handle errors gracefully
- Keep dependencies up to date

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding missing tests
- **chore**: Changes to build process or auxiliary tools

### Examples

```
feat(backend): add user authentication with JWT

- Add JWT token generation
- Add login endpoint
- Add authentication middleware

Closes #123
```

```
fix(frontend): resolve navigation stack issue

The back button was not working correctly on ItemDetailsScreen.
This fix ensures proper navigation state management.

Fixes #456
```

```
docs: update API documentation

Add missing examples for PUT endpoints
```

## Pull Request Process

### Before Submitting

1. **Update documentation** - Ensure README, code comments, and any relevant docs are updated
2. **Add tests** - Include tests for new features or bug fixes
3. **Run tests** - Ensure all tests pass
4. **Build successfully** - Make sure both frontend and backend build without errors
5. **Follow coding standards** - Adhere to the project's coding guidelines
6. **Update CHANGELOG** - Add your changes to CHANGELOG.md

### PR Checklist

- [ ] Code builds successfully
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Commit messages follow guidelines
- [ ] Code follows project standards
- [ ] No merge conflicts

### PR Title Format

Use conventional commit format:
```
feat: add user profile screen
fix: resolve database connection issue
docs: update installation instructions
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code commented where necessary
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. Submit your PR
2. Wait for automated checks to complete
3. Address any review comments
4. Maintainers will review and merge

## Project Structure

### Adding New Features

#### Backend: New Entity

1. Create entity in `Entities/`
2. Add DbSet to `ApplicationDbContext`
3. Create DTOs in `Models/`
4. Create service interface and implementation in `Services/`
5. Create controller in `Controllers/`
6. Register service in `Program.cs`
7. Add tests
8. Update documentation

#### Frontend: New Screen

1. Create screen component in `screens/`
2. Add route to `AppNavigator.js`
3. Create Redux slice if needed in `store/slices/`
4. Add API calls to `utils/api.js`
5. Add tests
6. Update documentation

## Style Guide

### Naming Conventions

#### Backend (C#)
- PascalCase for classes, methods, properties: `ItemService`, `GetItemById`
- camelCase for parameters and local variables: `itemId`, `userName`
- Prefix interfaces with `I`: `IItemService`

#### Frontend (JavaScript)
- PascalCase for components: `HomeScreen`, `Button`
- camelCase for functions and variables: `handleSubmit`, `itemList`
- UPPER_CASE for constants: `API_BASE_URL`

### File Organization

- One component per file
- Group related files together
- Use index files for cleaner imports
- Keep files focused and under 300 lines

## Getting Help

- Create an issue for questions
- Check existing issues first
- Include relevant context and examples
- Be patient and respectful

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Git commit history

Thank you for contributing to Hamza Tex! 🎉
