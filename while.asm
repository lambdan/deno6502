; a = 0
; while < 10:
;     a += 1

    LDA #$00 ; load A with 00
    STA $FF ; store A in FF

loop:
    INC $FF ; increment FF by 1
    LDA $FF ; load FF into A
    CMP #$0A ; compare A with 10
    BCC loop ; re-loop if A was not 10

