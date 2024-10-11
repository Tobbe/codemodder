The codemod should change all `Router` imports from `@redwoodjs/router` to
import from `@redwoodjs/vite/Router` instead. For the example input code it
should split the import statement into two separate import statements. The
first import statement should import the 'Router' from '@redwoodjs/vite/Router'
and the second import statement should import the 'Route' from
'@redwoodjs/router'.
