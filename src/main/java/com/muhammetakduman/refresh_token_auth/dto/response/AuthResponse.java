package com.muhammetakduman.refresh_token_auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

//Refresh token response body de göndermiyorum çünkü ;
//Refresh token'ı sadece HttpOnly cookie'de saklıyorum ve istemci tarafında erişilebilir değil.
// Bu, güvenliği artırmak için yaygın bir uygulamadır, çünkü refresh token'lar genellikle uzun ömürlüdür
// ve kötü niyetli aktörler tarafından ele geçirilme riski daha yüksektir.

public class AuthResponse {
    private String accessToken;
    private String tokenType;
}
