# Contributing to LinkChain

First off, thank you for considering contributing to LinkChain! 🎉

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs what actually happened
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node version)

### Suggesting Features

Feature suggestions are welcome! Please provide:

- **Clear use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - What other approaches did you think about?

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test thoroughly** - Make sure everything works
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit the pull request**

## 🛠️ Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/linkchain.git
cd linkchain

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start development servers
npm run dev      # Frontend (Terminal 1)
npm run server   # Backend (Terminal 2)
```

## 📝 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for new frontend code
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Prefer functional components with hooks

```typescript
// ✅ Good
const handleTipClick = (amount: number) => {
  // Process tip payment
  sendTip(amount);
};

// ❌ Avoid
function a(x) {
  b(x);
}
```

### React Components

- One component per file
- Use functional components
- Extract reusable logic into hooks
- Keep components small and focused

```typescript
// ✅ Good
export default function TipButton({ amount, onClick }: TipButtonProps) {
  return (
    <button onClick={() => onClick(amount)}>
      Tip ${amount}
    </button>
  );
}

// ❌ Avoid
export default function Page() {
  // 500 lines of code with multiple responsibilities
}
```

### CSS/Styling

- Use Tailwind CSS utilities
- Follow mobile-first approach
- Use existing color scheme
- Maintain consistent spacing

```tsx
// ✅ Good
<div className="flex items-center space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800">

// ❌ Avoid
<div style={{ display: 'flex', padding: '16px' }}>
```

### Backend API

- RESTful endpoint design
- Proper error handling
- Input validation
- Authentication where needed

```javascript
// ✅ Good
router.post('/tips', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // Process tip
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

## 🧪 Testing

Before submitting:

1. **Test all user flows** - Signup, login, customize, tip, etc.
2. **Test on mobile** - Use browser dev tools or real device
3. **Test error cases** - What happens when things go wrong?
4. **Check console** - No errors or warnings
5. **Verify types** - TypeScript should compile without errors

```bash
# Build and check for errors
npm run build

# Run linter
npm run lint
```

## 📚 Documentation

- Update README.md if you change core functionality
- Add JSDoc comments for complex functions
- Update relevant .md files in the docs folder
- Include code examples for new features

```typescript
/**
 * Sends a tip to a creator on the Stacks blockchain
 * @param creatorAddress - Stacks address of the creator
 * @param amount - Tip amount in STX
 * @param message - Optional tip message
 * @returns Transaction ID
 */
export async function sendTip(
  creatorAddress: string,
  amount: number,
  message?: string
): Promise<string> {
  // Implementation
}
```

## 🎨 Design Guidelines

### UI/UX Principles

1. **Hide Complexity** - No crypto jargon visible to users
2. **Mobile First** - Most users are on mobile
3. **Fast Feedback** - Show loading states, confirmations
4. **Error Recovery** - Help users fix problems
5. **Accessibility** - Keyboard navigation, screen readers

### Color Palette

```css
Primary: #8b5cf6 (Purple)
Secondary: #ec4899 (Pink)
Success: #10b981 (Green)
Error: #ef4444 (Red)
Warning: #f59e0b (Orange)
```

### Component Guidelines

- Use existing UI components from `components/ui/`
- Match the existing design system
- Maintain consistent spacing (4px grid)
- Use existing animations (Framer Motion)

## 🌳 Branch Naming

```
feature/add-custom-domains
bugfix/fix-wallet-connection
hotfix/critical-security-issue
docs/update-setup-guide
refactor/improve-api-structure
```

## 💬 Commit Messages

```
✨ feat: Add custom domain support
🐛 fix: Resolve wallet connection timeout
📝 docs: Update deployment guide
♻️ refactor: Simplify tip payment flow
🎨 style: Improve button hover effects
⚡ perf: Optimize database queries
✅ test: Add tip flow tests
🔧 chore: Update dependencies
```

## 🔍 Code Review Process

1. **Automated checks** must pass (linting, build)
2. **Manual review** by maintainers
3. **Testing** on staging environment
4. **Approval** from at least one maintainer
5. **Merge** to main branch

## 🚀 Release Process

1. Version bump following [Semantic Versioning](https://semver.org/)
2. Update CHANGELOG.md
3. Tag release in git
4. Deploy to production
5. Announce in Discord/Twitter

## 📋 Pull Request Template

When you create a PR, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Tested on mobile
- [ ] No console errors
- [ ] All flows working

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Commit messages are clear
```

## 🤝 Community Guidelines

### Be Respectful

- Be welcoming to newcomers
- Assume good intentions
- Give constructive feedback
- Be patient with questions

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **Pull Requests** - Code contributions
- **Discussions** - General questions, ideas
- **Discord** - Real-time chat (coming soon)

## 📖 Resources

### Learn About the Stack

- [Next.js Documentation](https://nextjs.org/docs)
- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language](https://docs.stacks.co/clarity)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Project Documentation

- [Project Summary](./PROJECT_SUMMARY.md) - Architecture overview
- [Setup Guide](./SETUP.md) - Development setup
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Feature List](./FEATURES.md) - All features

## 🎯 Good First Issues

Looking for where to start? Check issues labeled:

- `good first issue` - Perfect for newcomers
- `help wanted` - We need community help
- `documentation` - Improve docs
- `bug` - Fix existing issues

## 🏆 Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to the contributors channel
- Given credit in the README

## ❓ Questions?

- Check existing documentation first
- Search closed issues and PRs
- Ask in GitHub Discussions
- Join our Discord (coming soon)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making LinkChain better! Every contribution, no matter how small, helps creators worldwide. 🙏

**Happy Coding!** 🚀
