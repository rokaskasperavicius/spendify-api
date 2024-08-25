// export const deleteAccountHandler = async (req: ServerRequest<DeleteAccountBody>, res: ServerResponse) => {
//   validationResult(req).throw()

//   const { userId } = res.locals
//   const { accountId } = req.body

//   await prisma.accounts.deleteMany({
//     where: {
//       account_id: accountId,
//       AND: {
//         user_id: userId,
//       },
//     },
//   })

//   res.json({
//     success: true,
//   })
// }
