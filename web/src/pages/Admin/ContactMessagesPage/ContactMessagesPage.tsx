import { Metadata } from '@cedarjs/web'
import type { CellSuccessProps, CellFailureProps } from '@cedarjs/web'
import { createCell } from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast, Toaster } from '@cedarjs/web/toast'
import { Trash2 } from 'lucide-react'

import { Button } from 'src/components/ui/button'
import { Card, CardContent } from 'src/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'src/components/ui/table'

const QUERY = gql`
  query AdminContactMessagesQuery {
    adminContactMessages {
      id
      name
      email
      message
      createdAt
    }
  }
`

const DELETE_MESSAGE = gql`
  mutation AdminDeleteContactMessage($id: Int!) {
    adminDeleteContactMessage(id: $id) {
      id
    }
  }
`

const Loading = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-white/5" />
        ))}
      </div>
    </CardContent>
  </Card>
)

const Empty = () => (
  <Card>
    <CardContent className="p-12 text-center text-white/40">No messages yet.</CardContent>
  </Card>
)

const Failure = ({ error }: CellFailureProps) => (
  <div className="text-racing-red">Error: {error?.message}</div>
)

const Success = ({ adminContactMessages: messages }: CellSuccessProps) => {
  const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    onCompleted: () => toast.success('Message deleted'),
    refetchQueries: ['AdminContactMessagesQuery'],
  })

  const handleDelete = (id: number) => {
    if (confirm('Delete this message?')) {
      deleteMessage({ variables: { id } })
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg) => (
              <TableRow key={msg.id}>
                <TableCell className="font-medium text-white">{msg.name}</TableCell>
                <TableCell>{msg.email}</TableCell>
                <TableCell className="max-w-xs truncate">{msg.message}</TableCell>
                <TableCell className="text-white/40">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(msg.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

const MessagesCell = createCell({ QUERY, Loading, Empty, Failure, Success })

const AdminContactMessagesPage = () => (
  <>
    <Metadata title="Messages - Admin" />
    <Toaster />
    <h1 className="mb-6 font-heading text-2xl font-bold tracking-wider text-white">Contact Messages</h1>
    <MessagesCell />
  </>
)

export default AdminContactMessagesPage
