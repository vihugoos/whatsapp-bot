# bot-wpp doc 

Fluxos:

1 - Usuário segue o fluxo padrão, realiza o cadastro e escolhe o número do serviço desejado. <br/>
2 - [Trocou de número]: Escolhe a opção que já possui um cadastro, confirma o CPF e o bot atualiza o cadastro do cliente automáticamente. <br/>
3 - Afirmou que possuía um cadastro anterior, porém, não foi encontrado nenhum cadastro com o CPF informado no nosso banco de dados, realizar o cadastro. <br/>
4 - Falar com um representante comercial (a mensagem não é encaminhada para ninguém, a conversa continua do wpp da Liber para melhor formalidade).

Flags:

✅ "atendimento finalizado": Caso algum funcionário da Liber envie uma msg que possui essas duas palavras inclusas, o bot finaliza o atendimento imediamente.
